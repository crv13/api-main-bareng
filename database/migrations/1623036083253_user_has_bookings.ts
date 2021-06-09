import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UserHasBookings extends BaseSchema {
  protected tableName = 'user_has_bookings'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('user_id').unsigned().references('users.id').notNullable()
      table.integer('booking_id').unsigned().references('bookings.id').notNullable()

      table.primary(['user_id', 'booking_id'])
      /**
       * Uses timestampz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamps(true, true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
