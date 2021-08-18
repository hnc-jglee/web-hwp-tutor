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

    // TODO: VPC 확인
    const vpc = new ec2.Vpc(this, 'web-hwp-vpc', {
      cidr: '10.170.0.0/17',
      natGateways: 1,
      subnetConfiguration: [
        {
          cidrMask: 23,         // TODO: cidr: 10.170.10.0/23
          name: 'dmz',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 23,         // TODO: cidr: 10.170.30.0/23
          name: 'was',
          subnetType: ec2.SubnetType.PRIVATE,
        },
        {
          cidrMask: 23,         // TODO: cidr: 10.170.40.0/23
          name: 'app',
          subnetType: ec2.SubnetType.PRIVATE,
        },
        {
          cidrMask: 23,         // TODO: cidr: 10.170.70.0/23
          name: 'db',
          subnetType: ec2.SubnetType.PRIVATE,
        }
      ]
    });

    // TODO: ECR 확인
    const ecrRepo = new ecr.Repository(this, 'web-hwp-ecr');

    // TODO: ECS 확인
    const cluster = new ecs.Cluster(this, 'web-hwp-cluster', {
      vpc: vpc,
      capacity: {
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      }
    });

    // TODO: lambda 확인
    const bucket = new s3.Bucket(this, "web-hwp-bucket");
    const handler = new lambda.Function(this, "web-hwp-lambda", {
      runtime: lambda.Runtime.NODEJS_10_X,
      code: lambda.Code.fromAsset("src"),
      handler: "webhwp.main",
      environment: {
        BUCKET: bucket.bucketName
      }
    });

    bucket.grantReadWrite(handler);

    // TODO: API G/W 확인
    const api = new apigateway.RestApi(this, "web-hwp-api", {
      restApiName: "Web Hwp API",
    });
    const getMethodTest = new apigateway.LambdaIntegration(handler, {
      requestTemplates: { "application/json": '{ "statusCode": "200" }' }
    });
    api.root.addMethod("GET", getMethodTest);

    // TODO: Security Group, Role 확인
    const securityGroup = new ec2.SecurityGroup(this, 'web-hwp-sg', {
      vpc,
      description: 'Web Hwp Security Group',
      allowAllOutbound: true
    });
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow SSH Access');
    const role = new iam.Role(this, 'web-hwp-role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com')
    });

    // TODO: lambda(nodejs) or tutor image 결정, ECR에 이미지 업로드
    // const tutor = new ecsp.ApplicationLoadBalancedFargateService(this, 'tutor', {
    //   cluster,
    //   taskImageOptions: {
    //     image: ecs.ContainerImage.fromEcrRepository(ecrRepo, 'tutor'),
    //   },
    //   publicLoadBalancer: true
    // });
    // const manual = new ecsp.ApplicationLoadBalancedFargateService(this, 'manual', {
    //   cluster,
    //   taskImageOptions: {
    //     image: ecs.ContainerImage.fromEcrRepository(ecrRepo, 'manual'),
    //   },
    //   publicLoadBalancer: true
    // });
    // const webIde = new ecsp.ApplicationLoadBalancedFargateService(this, 'web-ide', {
    //   cluster,
    //   taskImageOptions: {
    //     image: ecs.ContainerImage.fromEcrRepository(ecrRepo, 'web-ide'),
    //   },
    //   publicLoadBalancer: true
    // });
    // const webHwp = new ecsp.ApplicationLoadBalancedFargateService(this, 'web-hwp', {
    //   cluster,
    //   taskImageOptions: {
    //     image: ecs.ContainerImage.fromEcrRepository(ecrRepo, 'web-hwp'),
    //   },
    //   publicLoadBalancer: true
    // });

    // TODO: Elasticsearch 확인
    // const webHwpDomain = new es.Domain(this, 'Domain', {
    //   version: es.ElasticsearchVersion.V7_10,
    //   enableVersionUpgrade: true // defaults to false
    // });

    // TODO: Kibana 확인

  }
}
