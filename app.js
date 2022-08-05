var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const helmet = require('helmet');
const session = require('express-session');
const passport = require('passport');

//モデルの読み込み
const User = require('./models/user');
const Schedule = require('./models/schedule');
const Availability = require('./models/availability');
const Candidate = require('./models/candidate');
const Comment = require('./models/comment');

//読み込んだモデルをもとに、DBのテーブルを作成していく
/* 
  最初にUserモデルに対応したテーブルを作り、その後各テーブルを作っていく
*/
//sync関数...モデルに合わせてデータベースのテーブルを作成する
//belongsTo...モデル間（テーブル間）の関係を設定する関数の一つ（外部キーの設定を忘れずに）
User.sync().then(async () => {  //無名関数でもasyncつけることで、非同期処理が行える
  Schedule.belongsTo(User, {foreignKey: 'createdBy'});  /* ScheduleがUserの従属エンティティであることを示す（外部キーは作成日時） */
  Schedule.sync();
  Comment.belongsTo(User, {foreignKey: 'userId'});
  Comment.sync();
  Availability.belongsTo(User, {foreignKey: 'userId'});
  await Candidate.sync();  /* AvailabilityはCandidateに従属しているので、Candidateテーブルが作成され終わるのをawaitで待つ必要がある */
  Availability.belongsTo(Candidate, {foreignKey: 'candidateId'});
  Availability.sync();
})

const GitHubStrategy = require('passport-github2').Strategy;

//IDや鍵は.gitignoreの対象となっている別ファイルから読み込むようにする（セキュリテイ向上のため）
const env = require('./env');

const GITHUB_CLIENT_ID = env.GITHUB_CLIENT_ID;  /* ClientIDを設定*/
const GITHUB_CLIENT_SECRET = env.GITHUB_CLIENT_SECRET;  /* ClientSecretを設定 */

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

//GitHub認証が実行された際に呼び出される処理
passport.use(new GitHubStrategy({
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: 'http://localhost:8000/auth/github/callback'
  },

  //GitHub認証時のユーザーのIDと名前をUserテーブルに保管する
  function (accessToken, refreshToken, profile, done) {
    process.nextTick(async function () {
      await User.upsert({  //upsert...INSERT or UPDATEを行う（upsertは造語）
        userId: profile.id,
        username: profile.username
      });
      done(null, profile);
    });
  }
));

var indexRouter = require('./routes/index');
const loginRouter = require('./routes/login');
const logoutRouter = require('./routes/logout');

var app = express();
app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({ secret: env.SESSION_SECRET_KEY, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);

app.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] }),
  function (req, res) {
});

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function (req, res) {
    res.redirect('/');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
