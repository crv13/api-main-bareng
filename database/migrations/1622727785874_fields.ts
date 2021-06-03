import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Fields extends BaseSchema {
  protected tableName = 'fields'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name', 45).notNullable()
      table.enum('type', ['soccer', 'minisoccer', 'futsal', 'basketball', 'volleyball']).notNullable()
      table
      .integer('venue_id')
      .unsigned()
      .references('venues.id')
      .onDelete('cascade')
      .notNullable()
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
