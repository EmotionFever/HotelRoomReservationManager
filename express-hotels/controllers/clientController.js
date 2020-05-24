var Hotel = require('../models/hotel');
var RoomType = require('../models/room_type');
var Reservation = require('../models/reservation');
require('../models/hotel');
var async = require('async');
const { sanitizeBody } = require('express-validator/filter');


// Display list of all RoomTypes for a Hotel.
exports.client_reservation_list = function(req, res) {

    Reservation.find({ 'email' : req.params.email })
    .populate({path:'room_type', populate:{
        path:'hotel',
        select:'name'
    }})
    .populate('card')
    .exec(function (err, reservations) {
      for(let i = 0; i < reservations.length; i++){
        RoomType.findById(reservations[i].room_type._id)
          .populate({path: 'hotel', select: 'name'})
          .exec(function(err,room_type){
          //posso continuar a escrever? se tiver algo mal diz
            if(err)
              res.json({ title: 'Reservation List', error: err});
            reservations[i].room_type = room_type; 
          });
        }  
        res.json({ title: 'Reservation List', error: err, reservation_list: reservations});
      });
};

exports.client_update_reservation = [

  sanitizeBody('begin_date').toDate(),
  sanitizeBody('end_date').toDate(),
  sanitizeBody('card_number').toInt(),

  (req, res) => {

    async.waterfall([
      function(callback){
        Reservation.findById(req.body.id)
        .exec(callback);
      },
      function(reservation, callback){
        var newReservation;
        newReservation = new Reservation({
          name: reservation.name,
          price : req.body.price,
          begin_date: req.body.begin_date ,
          end_date: req.body.end_date ,
          email: reservation.email,
          card_number: req.body.card_number,
          telephone: reservation.telephone,
          address: reservation.address,
          nif: reservation.nif,
          room_type:reservation.room_type,
          _id:req.body.id
        });
        callback(null, newReservation);
      },
      function(newReservation, callback){
        Reservation.findByIdAndUpdate(req.body.id, newReservation, {}, function (err,thereservation) {
          if (err) { 
            res.json({ title: 'Update Reservation', result: false , error:err});
          }else
            res.json({ title: 'Update Reservation', result: true});
           }
         );
      }
    ])
    
    
}]