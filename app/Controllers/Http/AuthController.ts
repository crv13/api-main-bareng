import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'
import Mail from '@ioc:Adonis/Addons/Mail'
import Database from '@ioc:Adonis/Lucid/Database'

export default class AuthController {
  /**
     * 
     * @swagger
     * paths:
     *      /api/v1/register:
     *          post:
     *              tags:
     *                  - Authentication
     *              description: Send an email of OTP code to be used in `otp-confirmation` endpoint
     *              summary: create new user
     *              requestBody:
     *                  required: true
     *                  content:
     *                      application/x-www-form-urlencoded:
     *                          schema:
     *                              $ref: '#definitions/User'
     *              responses:
     *                  201:
     *                      description: 'success, check OTP code on your email'
     *                  422:
     *                      description: 'false entity on request'
     *                  500:
     *                      description: 'Duplicate Email, Email already exist'
     */
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

  /**
     * 
     * @swagger
     * paths:
     *      /api/v1/login:
     *          post:
     *              security:
     *                  - bearerAuth: []
     *              tags:
     *                  - Authentication
     *              summary: login to user account
     *              description: Returning an bearer token which can be used to browse the website
     *              requestBody:
     *                  required: true
     *                  content:
     *                      application/x-www-form-urlencoded:
     *                          schema:
     *                              type: object
     *                              properties:
     *                                  email:
     *                                      type: string
     *                                      format: email
     *                                  password:
     *                                      type: string
     *                              required:
     *                                  - email
     *                                  - password
     *              responses:
     *                  200:
     *                      description: 'login success'
     *                  417:
     *                      description: 'Account not verified'
     */
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

  /**
     * 
     * @swagger
     * paths:
     *      /api/v1/otp-confirmation:
     *          post:
     *              tags:
     *                  - Authentication
     *              description: altering is_verified value in database to `true`
     *              summary: otp confirmation for certain email
     *              requestBody:
     *                  required: true
     *                  content:
     *                      application/x-www-form-urlencoded:
     *                          schema:
     *                              type: object
     *                              properties:
     *                                  email:
     *                                      type: string
     *                                      format: email
     *                                  otp_code:
     *                                      type: integer
     *                              required:
     *                                  - email
     *                                  - otp_code
     *              responses:
     *                  200:
     *                      description: 'account verified'
     *                  417:
     *                      description: 'wrong otp'
     *                  404:
     *                      description: 'email not found'
     */
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
