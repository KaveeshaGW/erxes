import { ASSET_STATUSES } from '../../common/constant/asset';
import { IAssetDocument } from '../../common/types/asset';
import { IContext } from '../../connectionResolver';
import { sendKbMessage } from '../../messageBroker';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Assets.findOne({ _id });
  },

  category(asset: IAssetDocument, _, { dataLoaders }: IContext) {
    return (
      (asset.categoryId &&
        dataLoaders.assetCategories.load(asset.categoryId)) ||
      null
    );
  },

  parent(asset: IAssetDocument, _, { dataLoaders }: IContext) {
    return (asset.parentId && dataLoaders.asset.load(asset.parentId)) || null;
  },

  isRoot(asset: IAssetDocument, {}) {
    return asset.parentId ? false : true;
  },

  async childAssetCount(asset: IAssetDocument, {}, { models }: IContext) {
    const order = asset.order.slice(-1)
      ? asset.order.replace(/\\/g, '\\\\')
      : asset.order;

    let filter: string | object = { $regex: new RegExp(order) };

    if (asset.order.match(/\\/)) {
      filter = asset.order;
    }

    const asset_ids = await models.Assets.find({ order: filter }, { _id: 1 });

    return models.Assets.countDocuments({
      parentId: { $in: asset_ids },
      status: { $ne: ASSET_STATUSES.DELETED }
    });
  },

  vendor(asset: IAssetDocument, _, { dataLoaders }: IContext) {
    return (asset.vendorId && dataLoaders.company.load(asset.vendorId)) || null;
  },

  async knowledgeData(asset: IAssetDocument, _, { subdomain }: IContext) {
    const articles = await sendKbMessage({
      subdomain,
      action: 'articles.find',
      data: {
        query: {
          _id: { $in: asset.kbArticleIds || [] }
        }
      },
      isRPC: true,
      defaultValue: []
    });

    const map = {};

    for (const article of articles) {
      if (!map[article.categoryId]) {
        map[article.categoryId] = [];
      }

      map[article.categoryId].push(article);
    }

    const results: any[] = [];

    for (const categoryId of Object.keys(map)) {
      const category = await sendKbMessage({
        subdomain,
        action: 'categories.findOne',
        data: {
          query: {
            _id: categoryId
          }
        },
        isRPC: true
      });

      let topic: any;

      const item: any = {
        _id: category._id,
        title: category.title,
        description: category.description,
        contents: map[categoryId]
      };

      if (category.topicId) {
        topic = await sendKbMessage({
          subdomain,
          action: 'topics.findOne',
          data: {
            query: {
              _id: category.topicId
            }
          },
          isRPC: true,
          defaultValue: {}
        });
      }

      if (category.parentCategoryId) {
        const parentCategory = await sendKbMessage({
          subdomain,
          action: 'categories.findOne',
          data: {
            query: {
              _id: category.parentCategoryId
            }
          },
          isRPC: true,
          defaultValue: {}
        });

        topic.categories = [parentCategory];
      }

      if (topic) {
        item.topic = topic;
      }

      results.push(item);
    }

    return results;
  }
};
