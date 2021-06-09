/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('/register', 'AuthController.register').as('auth.register')
  Route.post('/login', 'AuthController.login').as('auth.login')
  Route.post('/verifikasi-otp', 'AuthController.otpConfirmation').as('auth.otpVerify')
    
  Route.group(() =>{
    Route.group(() =>{ 
      Route.resource('venues', 'VenuesController').apiOnly()
      Route.resource('venues.fields', 'FieldsController').apiOnly()
    }).middleware(['CheckVerify', 'CheckOwner'])
    
    Route.group(() => {
      Route.post('/venues/:id/bookings', 'VenuesController.booking').as('venues.booking')
      Route.get('/schedule','BookingsController.schedule').as('bookings.schedule')
      Route.get('/bookings', 'BookingsController.index').as('bookings.index')
      Route.get('/bookings/:id','BookingsController.show').as('bookings.show')
      Route.put('/bookings/:id/join','BookingsController.join').as('bookings.join')
      Route.put('/bookings/:id/unjoin', 'BookingsController.unjoin').as('bookings.unjoin')
    }).middleware(['CheckVerify', 'CheckUser'])
  }).middleware(['auth'])
}).prefix('api/v1')
