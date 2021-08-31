# WebHwp Tutor App

웹한글 기안기 튜토리얼 App

## AWS에 배포
```
$ npm install
$ npm run build
$ cd cdk
$ npm install
$ cdk bootstrap aws://<account-id>/<region>
$ cdk deploy WebHwpTutorAppStack
```

## 로컬 실행
```
$ npm start
```

## IaC(Infrastructure as Code)
[cdk/README.md](cdk/README.md) 참고
