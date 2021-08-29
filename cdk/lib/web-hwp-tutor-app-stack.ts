import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3Deployment from '@aws-cdk/aws-s3-deployment';
import * as route53 from '@aws-cdk/aws-route53';

export class WebHwpTutorAppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const webHwpAppS3 = new s3.Bucket(this, 'WebHwpAppBucket', {
      bucketName: 'webhwpapp',
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      websiteIndexDocument: 'index.html',
    });

    const webHwpAppS3Deployment = new s3Deployment.BucketDeployment(
      this,
      'WebHwpAppStaticWebsite',
      {
        sources: [s3Deployment.Source.asset('../build')],
        destinationBucket: webHwpAppS3,
      }
    );

    // TODO: webhwp.hcabp.hancom.com 서브 도메인 등록 확인
    // const zone = route53.HostedZone.fromLookup(this, 'com', {
    //   domainName: 'hancom.com'
    // });
    // const cName = new route53.CnameRecord(this, 'hancom.com', {
    //   zone: zone,
    //   recordName: 'webhwp.hcabp',
    //   domainName: webHwpAppS3.bucketWebsiteDomainName
    // });

    new cdk.CfnOutput(this, "WebHwpTutor URL", {
      value: webHwpAppS3.bucketWebsiteUrl
    });
  }
}
