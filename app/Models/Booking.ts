import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import UserHasBooking from './UserHasBooking'

export default class Booking extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public play_date_start: DateTime

  @column()
  public play_date_end: string

  @column()
  public user_id_booking: number

  @column()
  public field_id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => UserHasBooking, {
    foreignKey: 'booking_id'
  })
  public user_has_bookings: HasMany<typeof UserHasBooking>
}
