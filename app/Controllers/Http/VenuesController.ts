import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Field from 'App/Models/Field'
import Venue from 'App/Models/Venue'
import BookingValidator from 'App/Validators/BookingValidator'
import VenueValidator from 'App/Validators/VenueValidator'

export default class VenuesController {
  public async index({response}: HttpContextContract) {
    const venues = await Venue.query().preload('fields')
    return response.status(200).json({ message: 'Succes get Venues', data: venues})
  }

  public async store({request, response, auth}: HttpContextContract) {
    try {
      const data = await request.validate(VenueValidator)
      const newVenue = await Venue.create(data)

      const userId = auth.user?.id

      return response.created({ message: 'New Venue is Created!' })
    } catch (error) {
      return response.unprocessableEntity({ message: error.messages})
    }
  }

  public async show({response, params}: HttpContextContract) {
    const venue = await Venue.query().preload('fields').where('id', params.id).first()
    return response.ok({message: 'Success get Venue with Id', data: venue})
  }

  public async update({request, response, params, auth}: HttpContextContract) {
    let venue = await Venue.findOrFail(params.id)
    
    const userId = auth.user?.id

    venue.name = request.input('name')
    venue.phone = request.input('phone')
    venue.address = request.input('address')

    venue.save()

    return response.ok({ message: 'Venue has been Updated!'})
  }

  public async destroy({params, response}: HttpContextContract) {
    let venue = await Venue.findOrFail(params.id)
    await venue.delete()
    
    return response.ok({message: 'Venue has been Deleted!'})
  }

  public async booking({request, response, auth}: HttpContextContract) {
    try {
      let data = await request.validate(BookingValidator)
      let user = auth.user
      let field_data = await Field.findOrFail(data.field_id)
      let vid = field_data.venue_id

      if (request.param('id')!=vid){
          return response.notFound({message: `field dengan ID ${data.field_id} tidak terdapat pada venue tersebut`})
      }
      let data_booking= await user?.related('bookings').create({
          play_date_start: request.body().play_date_start,
          play_date_end: request.body().play_date_end,
          field_id: request.body().field_id
      })

      await user?.related('user_has_bookings').create({
          user_id: user.id,
          booking_id: data_booking?.id
      })
      response.created({message: 'booking berhasil dilakukan'})
    } catch (err){
      console.log(err)
        response.badRequest(err)
    }
  }
}
