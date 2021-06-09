import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'
import UserValidator from 'App/Validators/UserValidator'
import Mail from '@ioc:Adonis/Addons/Mail'
import Database from '@ioc:Adonis/Lucid/Database'

export default class AuthController {
  public async register({request, response}: HttpContextContract) {
    const name = request.input('name')
    const email = request.input('email')
    const password = request.input('password')
    const role = request.input('role')

    const newUser = await User.create({name, email, password, role})
    const otp_code = Math.floor(100000 + Math.random() * 900000)
    let saveCode = await Database.table('otp_codes').insert({otp_code: otp_code, user_id: newUser.id})
    await Mail.send((message) => {
      message
        .from('admin@mainbersama')
        .to(email)
        .subject('Welcome Onboard!')
        .htmlView('emails/otp_verification', {otp_code})
    })
    return response.created({ message: 'Register Success, please verify your otp code'})
  }
  public async login({ request, response, auth }: HttpContextContract) {
    const userSchema = schema.create({
      email: schema.string(),
      password: schema.string()
    })

    try {

      const email = request.input('email')
      const password = request.input('password')
      const payload = await request.validate({schema: userSchema})

      const token = await auth.use('api').attempt(email, password)

      return response.ok({message: 'login success', token})

    } catch (error) {
      if (error.guard) {
        return response.badRequest({message:'login error', error: error.message})
      } else {
        console.log(error.messages)
        return response.badRequest({message:'login error', error: error.messages})
      }
    }
  }

  public async otpConfirmation({request, response}:HttpContextContract) {
    let otp_code = request.input('otp_code')
    let email = request.input('email')

    let user = await User.findBy('email', email)
    let otpCheck = await Database.query().from('otp_codes').where('otp_code', otp_code).first()

    if (user?.id == otpCheck.user_id) {
      user.isVerified = true
      await user?.save()

      return response.status(200).json({message: 'berhasil konfirmasi OTP'})
    } else {
      return response.status(400).json({message: 'gagal verifikasi OTP'})
    }
  }
}
