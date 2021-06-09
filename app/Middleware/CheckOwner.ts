import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CheckOwner {
  public async handle ({auth, response}: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    let isOwner = (auth.user?.role=='owner')?true:false
    if (isOwner){
      await next()
    } else{
      response.unauthorized({message: 'akses ditolak'})
    }
  }
}
