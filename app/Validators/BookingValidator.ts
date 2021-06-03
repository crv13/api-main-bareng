import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class BookingValidator {
  constructor (protected ctx: HttpContextContract) {
  }

	/*
	 * Define schema to validate the "shape", "type", "formatting" and "integrity" of data.
	 *
	 * For example:
	 * 1. The username must be of data type string. But then also, it should
	 *    not contain special characters or numbers.
	 *    ```
	 *     schema.string({}, [ rules.alpha() ])
	 *    ```
	 *
	 * 2. The email must be of data type string, formatted as a valid
	 *    email. But also, not used by any other user.
	 *    ```
	 *     schema.string({}, [
	 *       rules.email(),
	 *       rules.unique({ table: 'users', column: 'email' }),
	 *     ])
	 *    ```
	 */
  public schema = schema.create({
	play_date_start: schema.date({
		format: 'yyyy-MM-dd HH:mm:ss'
	},[
		rules.after('today')
	]),
	play_date_end: schema.string({},[
		rules.maxLength(45)
	]),
	field_id: schema.number([
		rules.unsigned(),
		rules.exists({table: 'fields', column: 'id'})
	]),
  })

	/**
	 * Custom messages for validation failures. You can make use of dot notation `(.)`
	 * for targeting nested fields and array expressions `(*)` for targeting all
	 * children of an array. For example:
	 *
	 * {
	 *   'profile.username.required': 'Username is required',
	 *   'scores.*.number': 'Define scores as valid numbers'
	 * }
	 *
	 */
  public messages = {
	'required': '{{ field }} tidak boleh kosong',
	'play_date_start.after': 'Pemesanan minimal 1 hari sebelum bermain',
	'play_date_end.maxLength': '{{ field }} hanya menerima maksimal 45 karakter',
	'exists': '{{ field }} harus tersedia pada field.id'
  }
}
