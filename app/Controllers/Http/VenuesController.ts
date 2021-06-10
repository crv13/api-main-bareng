import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Field from 'App/Models/Field'
import Venue from 'App/Models/Venue'
import BookingValidator from 'App/Validators/BookingValidator'
import VenueValidator from 'App/Validators/VenueValidator'

export default class VenuesController {
  /**
     * 
     * @swagger
     * paths:
     *      /api/v1/venues:
     *          get:
     *              security:
     *                  - bearerAuth: []
     *              tags:
     *                  - Venues
     *              summary: show all venues data for owner
     *              responses:
     *                  200:
     *                      description: 'success'
     *                  401:
     *                      description: 'access denied'
     */
  public async index({response}: HttpContextContract) {
    const venues = await Venue.query().preload('fields')
    return response.status(200).json({ message: 'Succes get Venues', data: venues})
  }

  /**
     * 
     * @swagger
     * paths:
     *      /api/v1/venues:
     *          post:
     *              security:
     *                  - bearerAuth: []
     *              tags:
     *                  - Venues
     *              summary: create new venue for owner
     *              requestBody:
     *                  required: true
     *                  content:
     *                      application/x-www-form-urlencoded:
     *                          schema:
     *                              $ref: '#definitions/Venue'
     *              responses:
     *                  401:
     *                      description: 'access denied'
     *                  201:
     *                      description: 'success'
     *                  400:
     *                      description: 'bad request body value'
     */
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

  /**
     * 
     * @swagger
     * paths:
     *      /api/v1/venues/{id}:
     *          get:
     *              security:
     *                  - bearerAuth: []
     *              tags:
     *                  - Venues
     *              description: Showing list of bookings which `venues.id` is equal to `id` in query
     *              summary: show details of schedule in related venue for owner
     *              parameters:
     *                  - in: path
     *                    name: id
     *                    type: uint
     *                    required: true
     *                    description: ID of venue
     *                  - in: query
     *                    name: play_date_start
     *                    type: string
     *                    format: date
     *                    required: false
     *                    description: playing date of certain data
     *              responses:
     *                  200:
     *                      description: 'success'
     *                  401:
     *                      description: 'access denied'
     */
  public async show({response, params}: HttpContextContract) {
    const venue = await Venue.query().preload('fields').where('id', params.id).first()
    return response.ok({message: 'Success get Venue with Id', data: venue})
  }

  /**
     * 
     * @swagger
     * paths:
     *      /api/v1/venues/{id}:
     *          put:
     *              security:
     *                  - bearerAuth: []
     *              tags:
     *                  - Venues
     *              summary: update venue's data for role owner if the user is the owner of the venue
     *              parameters:
     *                  - in: path
     *                    name: id
     *                    type: uint
     *                    required: true
     *                    description: ID of venue
     *              requestBody:
     *                  required: true
     *                  content:
     *                      application/x-www-form-urlencoded:
     *                          schema:
     *                              $ref: '#definitions/Venue'
     *              responses:
     *                  401:
     *                      description: 'access denied'
     *                  200:
     *                      description: 'success'
     *                  400:
     *                      description: 'bad request body value'
     */
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

  /**
     * 
     * @swagger
     * paths:
     *      /api/v1/venues/{id}/bookings:
     *          post:
     *              security:
     *                  - bearerAuth: []
     *              tags:
     *                  - Venues
     *              summary: booking venue for users with role user
     *              parameters:
     *                  - in: path
     *                    name: id
     *                    type: uint
     *                    required: true
     *                    description: ID of venue
     *              requestBody:
     *                  required: true
     *                  content:
     *                      application/x-www-form-urlencoded:
     *                          schema:
     *                              $ref: '#definitions/Booking'
     *              responses:
     *                  404:
     *                      description: 'field_id not found'
     *                  401:
     *                      description: 'access denied'
     *                  201:
     *                      description: 'new booking added'
     *                  400:
     *                      description: 'bad request body value'
     */
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
