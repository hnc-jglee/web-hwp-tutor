import * as apigateway from '@aws-cdk/aws-apigateway';
import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecr from '@aws-cdk/aws-ecr';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ecsp from '@aws-cdk/aws-ecs-patterns';
import * as es from '@aws-cdk/aws-elasticsearch';
import * as iam from '@aws-cdk/aws-iam'
import * as lambda from "@aws-cdk/aws-lambda";
import * as s3 from "@aws-cdk/aws-s3";

export class WebHwpTutorStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'WebHwpVpc', {
      cidr: '10.170.0.0/17',
      maxAzs: 2,
      natGateways: 1,
    });
    // TODO: cdk deploy, cdk destroy 반복하면 가끔 conflict 발생한다. 일단 주석 처리
    // const dmzSubnet = vpc.publicSubnets[0].node.defaultChild as ec2.CfnSubnet;
    // dmzSubnet.addPropertyOverride('CidrBlock', '10.170.10.0/23');
    // const wasSubnet = vpc.privateSubnets[0].node.defaultChild as ec2.CfnSubnet;
    // wasSubnet.addPropertyOverride('CidrBlock', '10.170.30.0/23');
    // const appSubnet = vpc.privateSubnets[1].node.defaultChild as ec2.CfnSubnet;
    // appSubnet.addPropertyOverride('CidrBlock', '10.170.40.0/23');
    // const dbSubnet = vpc.privateSubnets[2].node.defaultChild as ec2.CfnSubnet;
    // dbSubnet.addPropertyOverride('CidrBlock', '10.170.70.0/23');

    let ecrRepo = ecr.Repository.fromRepositoryName(this, 'WebHwpEcr', "webhwpctrl");
    if (!ecrRepo) {
      ecrRepo = new ecr.Repository(this, 'WebHwpEcr', {
        repositoryName: "webhwpctrl",
      });
    }

    const cluster = new ecs.Cluster(this, 'WebHwpCluster', {
      vpc: vpc,
      capacity: {
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      }
    });

    // TODO: lambda 확인
    const bucket = new s3.Bucket(this, "WebHwpBucket", {
      bucketName: "webhwpctrl"
    });
    const handler = new lambda.Function(this, "WebHwpLambda", {
      runtime: lambda.Runtime.NODEJS_10_X,
      code: lambda.Code.fromAsset("src"),
      handler: "webhwp.main",
      environment: {
        BUCKET: bucket.bucketName
      }
    });

    bucket.grantReadWrite(handler);

    // TODO: API G/W 확인
    const api = new apigateway.RestApi(this, "WebHwpApi", {
      restApiName: "Web Hwp API",
    });
    const getMethodTest = new apigateway.LambdaIntegration(handler, {
      requestTemplates: { "application/json": '{ "statusCode": "200" }' }
    });
    api.root.addMethod("GET", getMethodTest);

    const webIde = new ecsp.ApplicationLoadBalancedFargateService(this, 'WebIde', {
      cluster,
      taskImageOptions: {
        // image: ecs.ContainerImage.fromRegistry('eclipse/che'),
        // image: ecs.ContainerImage.fromRegistry('codercom/code-server:3.11.1'),
        image: ecs.ContainerImage.fromRegistry('theiaide/theia:1.16.0'),
        containerPort: 3000
      },
      publicLoadBalancer: true
    });
    const webHwp = new ecsp.ApplicationLoadBalancedFargateService(this, 'WebHwp', {
      cluster,
      taskImageOptions: {
        image: ecs.ContainerImage.fromEcrRepository(ecrRepo, '1629'),
        containerPort: 8080
      },
      publicLoadBalancer: true
    });

    // TODO: Elasticsearch 확인
    // const webHwpDomain = new es.Domain(this, 'Domain', {
    //   version: es.ElasticsearchVersion.V7_10,
    //   enableVersionUpgrade: true // defaults to false
    // });

    // TODO: Kibana 확인

  }
}
