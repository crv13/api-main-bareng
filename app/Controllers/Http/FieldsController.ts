import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Field from 'App/Models/Field'
import Venue from 'App/Models/Venue'
import FieldValidator from 'App/Validators/FieldValidator'

export default class FieldsController {
  public async index({response, request}: HttpContextContract) {
    let data = await Database.from('fields').select('*').where({
      venue_id: request.param('venue_id')
    })
    response.ok({message: 'Field has been Loaded!', data})
  }

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

  public async show({response, request}: HttpContextContract) {
    let data = await Database.from('fields').select('*').where({
      id: request.param('id'),
      venue_id: request.param('venue_id')
    })
    response.ok({message: 'Fields has been Loaded!', data})
  }

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
