import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CheckVerify {
  public async handle ({auth, response}: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    let isVerified = auth.user?.isVerified
    if (isVerified){
      await next()
    } else {
      response.unauthorized({message: 'akun belum terverifikasi'})
    }
  }
}
