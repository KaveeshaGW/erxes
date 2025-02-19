import { checkPermission } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { sendMessageBroker } from '../../../messageBroker';
import {
  ITransaction,
  ITransactionDocument
} from '../../../models/definitions/transactions';
import { createLog, deleteLog, updateLog } from '../../../logUtils';

const transactionMutations = {
  savingsTransactionsAdd: async (
    _root,
    doc: ITransaction,
    { user, models, subdomain }: IContext
  ) => {
    const transaction = await models.Transactions.createTransaction(
      subdomain,
      doc
    );

    const logData = {
      type: 'transaction',
      newData: doc,
      object: transaction,
      extraParams: { models }
    };

    await createLog(subdomain, user, logData);

    return transaction;
  },

  /**
   * Updates a transaction
   */

  savingsTransactionsEdit: async (
    _root,
    { _id, ...doc }: ITransactionDocument,
    { models, user, subdomain }: IContext
  ) => {
    const transaction = await models.Transactions.getTransaction({
      _id
    });

    const updated = await models.Transactions.updateTransaction(
      subdomain,
      _id,
      doc
    );

    const logData = {
      type: 'transaction',
      object: transaction,
      newData: { ...doc },
      updatedDocument: updated,
      extraParams: { models }
    };

    await updateLog(subdomain, user, logData);

    return updated;
  },

  /**
   * Change a transaction
   */

  savingsTransactionsChange: async (
    _root,
    { _id, ...doc }: ITransactionDocument,
    { models, user, subdomain }: IContext
  ) => {
    const transaction = await models.Transactions.getTransaction({
      _id
    });

    const updated = await models.Transactions.changeTransaction(_id, doc);

    const logData = {
      type: 'transaction',
      object: transaction,
      newData: { ...doc },
      updatedDocument: updated,
      extraParams: { models }
    };

    await updateLog(subdomain, user, logData);

    return updated;
  },

  /**
   * Removes transactions
   */

  savingsTransactionsRemove: async (
    _root,
    { transactionIds }: { transactionIds: string[] },
    { models, user, subdomain }: IContext
  ) => {
    // TODO: contracts check
    const transactions = await models.Transactions.find({
      _id: { $in: transactionIds },
      isManual: true
    }).lean();

    await models.Transactions.removeTransactions(transactions.map(a => a._id));

    for (const transaction of transactions) {
      const logData = {
        type: 'transaction',
        object: transaction,
        extraParams: { models }
      };

      if (!!transaction.ebarimt && transaction.isManual)
        await sendMessageBroker(
          {
            action: 'putresponses.returnBill',
            data: {
              contentType: 'savings:transaction',
              contentId: transaction._id,
              number: transaction.number
            },
            subdomain
          },
          'ebarimt'
        );

      await deleteLog(subdomain, user, logData);
    }

    return transactionIds;
  }
};
checkPermission(transactionMutations, 'transactionsAdd', 'manageTransactions');
checkPermission(transactionMutations, 'transactionsEdit', 'manageTransactions');
checkPermission(
  transactionMutations,
  'transactionsChange',
  'manageTransactions'
);
checkPermission(
  transactionMutations,
  'transactionsRemove',
  'transactionsRemove'
);

export default transactionMutations;
