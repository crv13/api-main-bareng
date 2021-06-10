import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Field from 'App/Models/Field'
import Venue from 'App/Models/Venue'
import FieldValidator from 'App/Validators/FieldValidator'

export default class FieldsController {
  /**
     * 
     * @swagger
     * paths:
     *      /api/v1/venues/{venue_id}/fields:
     *          get:
     *              security:
     *                  - bearerAuth: []
     *              tags:
     *                  - Fields
     *              summary: show all fields where `venues.id = {venue_id}` for all user owner
     *              parameters:
     *                - in: path
     *                  name: venue_id
     *                  type: uint
     *                  required: true
     *                  description: containing id in database venues
     *              responses:
     *                  200:
     *                      description: 'success'
     *                  401:
     *                      description: 'access denied'
     */
  public async index({response, request}: HttpContextContract) {
    let data = await Database.from('fields').select('*').where({
      venue_id: request.param('venue_id')
    })
    response.ok({message: 'Field has been Loaded!', data})
  }

  /**
     * 
     * @swagger
     * paths:
     *      /api/v1/venues/{venue_id}/fields:
     *          post:
     *              security:
     *                  - bearerAuth: []
     *              tags:
     *                  - Fields
     *              summary: create new field for the owner of the venue
     *              parameters:
     *                - in: path
     *                  name: venue_id
     *                  type: uint
     *                  required: true
     *                  description: containing id in database venues
     *              requestBody:
     *                  required: true
     *                  content:
     *                      application/x-www-form-urlencoded:
     *                          schema:
     *                              $ref: '#definitions/Field'
     *              responses:
     *                  401:
     *                      description: 'access denied'
     *                  201:
     *                      description: 'success'
     *                  400:
     *                      description: 'bad request body value'
     */
  public async store({request, response, params, auth}: HttpContextContract) {
    try {
      const venue = await Venue.findOrFail(params.venue_id)
      const data = await request.validate(FieldValidator)
     
      const newField = new Field()
      const userId = auth.user?.id

      newField.name = data.name
      newField.type = data.type

      venue.related('fields').save(newField)
      
      return response.created({message: 'New Field is Created!'})
    } catch (error) {
      console.log(error)
      return response.unprocessableEntity({message: error.messages})
    }   
  }

  /**
     * 
     * @swagger
     * paths:
     *      /api/v1/venues/{venue_id}/fields/{id}:
     *          get:
     *              security:
     *                  - bearerAuth: []
     *              tags:
     *                  - Fields
     *              description: Showing list of fields which `venues.id` is equal to `venues_id` and `fields.id` equal to `id` in query
     *              summary: show details of fields for all users owner
     *              parameters:
     *                  - in: path
     *                    name: id
     *                    type: uint
     *                    required: true
     *                    description: ID of field
     *                  - in: path
     *                    name: venue_id
     *                    type: uint
     *                    required: true
     *                    description: ID of venue
     *              responses:
     *                  200:
     *                      description: 'success'
     *                  401:
     *                      description: 'access denied'
     */
  public async show({response, request}: HttpContextContract) {
    let data = await Database.from('fields').select('*').where({
      id: request.param('id'),
      venue_id: request.param('venue_id')
    })
    response.ok({message: 'Fields has been Loaded!', data})
  }

  /**
     * 
     * @swagger
     * paths:
     *      /api/v1/venues/{venue_id}/fields/{id}:
     *          put:
     *              security:
     *                  - bearerAuth: []
     *              tags:
     *                  - Fields
     *              summary: update fields's data for role owner if the user is the owner of the venue
     *              parameters:
     *                  - in: path
     *                    name: id
     *                    type: uint
     *                    required: true
     *                    description: ID of field
     *                  - in: path
     *                    name: venue_id
     *                    type: uint
     *                    required: true
     *                    description: ID of venue
     *              requestBody:
     *                  required: true
     *                  content:
     *                      application/x-www-form-urlencoded:
     *                          schema:
     *                              $ref: '#definitions/Fields'
     *              responses:
     *                  401:
     *                      description: 'access denied'
     *                  200:
     *                      description: 'success'
     *                  400:
     *                      description: 'bad request body value'
     */
  public async update({request, response, auth}: HttpContextContract) {
    try {
      let data = await request.validate(FieldValidator)
      let venue = await Venue.findByOrFail('id', request.param('venue_id'))
      let field = await Field.findOrFail(request.param('id'))
      
      const userId = auth.user?.id

        field.name = data.name
        field.type = data.type

        await field.save()
        response.ok({message: 'Field has been Updated!'})
  
    } catch (error) {
      response.badRequest({message: error})
    }
  }
}
