'use strict';
const {sequelize, DataTypes} = require('./sequelize-loader');

const User = sequelize.define(
  'users',
  {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    freezeTableName: true,  //テーブル名とモデル名を同じにさせるための設定（Sequelizeのデフォルトでは、テーブル名はモデル名の複数形になるので）
    timestamps: false  //タイムスタンプは作成しない
  }
);

module.exports = User;