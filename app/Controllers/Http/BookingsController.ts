import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import UserHasBooking from 'App/Models/UserHasBooking'

export default class BookingsController {
  public async index({response}: HttpContextContract) {
    let data = await Database.from('bookings').select('*')
    response.ok({message: 'ok', data})
  }

  public async show({response, request}: HttpContextContract) {
    let data = await Database.from('bookings').select('*').where({id: request.param('id')
    })

    let data_pemain = await Database.from('bookings')
    .join('user_has_bookings', 'bookings.id','=','user_has_bookings.booking_id')
    .join('users','user_has_bookings.user_id','=','users.id')
    .select(['user_id','name'])

    data['daftar_pemain'] = data_pemain
    response.ok({message: 'loaded', data})
  }

  public async join({request, response, auth}: HttpContextContract) {
    let userAuth = auth.user

    await userAuth?.related('user_has_bookings').create({
      user_id: userAuth.id,
      booking_id: request.param('id')
    })

    response.created({message: 'berhasil join'})
  }

  public async unjoin({response, request, auth}:HttpContextContract){
    let userauth = auth.user
    try{
        let data = await Database.from('user_has_bookings').where({
            user_id: userauth?.id,
            booking_id: request.param('id')
        }).delete()
        if (data.length==0){ //biarin aja, bener kok
            throw('Data tidak tersedia')
        }
        response.ok({message: 'unjoin berhasil'})
    } catch (err){
        response.notFound({message: err})
    }
  }

  public async schedule({ response}:HttpContextContract){
    let list_id_on = await Database.from('api_tokens').distinct('user_id')
    let users = await User.query().preload('user_has_bookings')
    let newData: {user_id: number, schedule:UserHasBooking[]}[] = [] 
    list_id_on.forEach((uid) =>{
      for (let i=0;i<users.length;i++){
        if (users[i].id == uid.user_id) {
            newData.push({
              user_id: uid.user_id,
              schedule: users[i].user_has_bookings
          })
        }
      }
    })
    response.ok({message: 'loaded', data: newData})
  }
}
