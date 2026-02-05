'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Roles',[
     {
      name:'User',
     },
      {
      name:'Seller',
     },
      {
      name:'Admin',
     },


    ]
  
  )
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Roles',null,{})
  }
};
