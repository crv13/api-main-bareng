import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Bookings extends BaseSchema {
  protected tableName = 'bookings'

  public async up () {
    this.schema.table(this.tableName, (table) => {
      table
      .integer('user_id_booking')
      .unsigned()
      .references('users.id')
      .onDelete('CASCADE')
      .notNullable()
    })
  }

  public async down () {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('user_id_booking')
    })
  }
}
