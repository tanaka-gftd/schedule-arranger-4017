'use strict';
const {sequelize, DataTypes} = require('./sequelize-loader');

const Schedule = sequelize.define(
  'schedules',
  {
    scheduleId: {
      type: DataTypes.UUID,  //UUID...Universally Unique Identifier の略。 全世界で同じ値を持つことがない一意な識別子。
      primaryKey: true,
      allowNull: false
    },
    scheduleName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    memo: {
      type: DataTypes.TEXT,  //文字列の長さに制限を設けない
      allowNull: false
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  },
  {
    freezeTableName: true,
    timestamps: false,
    indexes: [  //検索を速くするために、インデックスを作成しておく
      {
        fields: ['createdBy']
      }
    ]
  }
);

module.exports = Schedule;