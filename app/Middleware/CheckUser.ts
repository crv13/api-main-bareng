import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CheckUser {
  public async handle ({auth, response}: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    let isUser = (auth.user?.role==='user')?true:false
    if (isUser){
      await next()
    } else {
      response.unauthorized({message: 'akses ditolak'})
    }
  }
}
