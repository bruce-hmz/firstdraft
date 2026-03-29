import { DefaultTemplate } from './DefaultTemplate';
import { MobileAppTemplate } from './MobileAppTemplate';
import { PhysicalProductTemplate } from './PhysicalProductTemplate';

export enum TemplateType {
  DEFAULT = 'default',
  MOBILE_APP = 'mobile-app',
  PHYSICAL_PRODUCT = 'physical-product',
}

export interface TemplateProps {
  content: any;
  showBranding?: boolean;
}

export const templates = {
  [TemplateType.DEFAULT]: DefaultTemplate,
  [TemplateType.MOBILE_APP]: MobileAppTemplate,
  [TemplateType.PHYSICAL_PRODUCT]: PhysicalProductTemplate,
};

export const getTemplate = (type: TemplateType = TemplateType.DEFAULT) => {
  return templates[type] || templates[TemplateType.DEFAULT];
};

export const templateList = [
  {
    type: TemplateType.DEFAULT,
    name: '默认 SaaS 模板',
    description: '适合软件产品、SaaS服务，经典落地页布局',
  },
  {
    type: TemplateType.MOBILE_APP,
    name: '移动应用模板',
    description: '适合手机App，突出预览展示和应用商店下载',
  },
  {
    type: TemplateType.PHYSICAL_PRODUCT,
    name: '实体商品模板',
    description: '适合实体产品，突出图片位置和购物体验',
  },
];
