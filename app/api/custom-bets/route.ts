import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Fetching custom bets from database...')
    
    // Check if pool is available
    if (!pool) {
      console.log('❌ Database pool not available')
      return NextResponse.json(
        { error: 'Database not connected' },
        { status: 500 }
      )
    }
    
    // Test database connection first
    console.log('🔍 Testing database connection...')
    await pool.query('SELECT 1')
    console.log('✅ Database connection successful')
    
    // Check if custom_bets table exists
    const tableCheckQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'custom_bets'
      );
    `
    const tableExists = await pool.query(tableCheckQuery)
    console.log('📊 Custom_bets table exists:', tableExists.rows[0].exists)
    
    if (!tableExists.rows[0].exists) {
      console.log('❌ Custom_bets table does not exist, returning empty array')
      return NextResponse.json([])
    }
    
    const query = `
      SELECT 
        cb.id,
        cb.title,
        cb.description,
        cb.category,
        cb.expired_day,
        cb.created_at,
        cb.updated_at,
        cb.is_active,
        cb.total_volume,
        cb.category_id,
        cbo.id as outcome_id,
        cbo.name as outcome_name,
        cbo.probability,
        cbo.color as outcome_color,
        cbo.volume as outcome_volume
      FROM custom_bets cb
      LEFT JOIN custom_bet_outcomes cbo ON cb.id = cbo.bet_id
      WHERE cb.is_active = true
      ORDER BY cb.created_at DESC
    `
    
    console.log('📡 Executing custom bets query...')
    const result = await pool.query(query)
    console.log('✅ Query successful, found', result.rows.length, 'rows')
    
    // Group outcomes by bet
    const betsMap = new Map()
    
    result.rows.forEach((row: any) => {
      if (!betsMap.has(row.id)) {
        betsMap.set(row.id, {
          id: row.id,
          title: row.title,
          description: row.description,
          category: row.category,
          expired_day: row.expired_day,
          created_at: row.created_at,
          updated_at: row.updated_at,
          is_active: row.is_active,
          total_volume: row.total_volume,
          category_id: row.category_id,
          outcomes: []
        })
      }
      
      if (row.outcome_id) {
        betsMap.get(row.id).outcomes.push({
          id: row.outcome_id,
          bet_id: row.id,
          name: row.outcome_name,
          probability: row.probability,
          color: row.outcome_color,
          volume: row.outcome_volume,
          created_at: row.created_at
        })
      }
    })
    
    const customBets = Array.from(betsMap.values())
    
    console.log('🎉 Custom bets fetched from database:', customBets.length)
    return NextResponse.json(customBets)
  } catch (error) {
    console.error('❌ Error fetching custom bets:', error)
    
    // Return detailed error information for debugging
    return NextResponse.json(
      { 
        error: 'Failed to fetch custom bets',
        details: error instanceof Error ? error.message : 'Unknown error',
        type: 'database_error'
      },
      { status: 500 }
    )
  }
}
