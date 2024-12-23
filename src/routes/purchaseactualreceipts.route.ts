import { Router } from 'express';
import DirectoryController from '@/controllers/purchaseactualreceipts.controller';

import { Routes } from '@interfaces/routes.interface';
import authMiddleware from '@middlewares/auth.middleware';

class PurchaseActualReceiptsRoute implements Routes {
  public path = '/po-actual-receipt/';
  public router = Router();

  public ObjDirectoryController = new DirectoryController();
  public conRedis: any;

  constructor() {
    this.initializeRoutes();
  }
  //authMiddleware
  private initializeRoutes() {
    this.router.post(`${this.path}po-list`, authMiddleware, this.ObjDirectoryController.getAllPOs);
    this.router.post(`${this.path}po-list-for-actual-receipt`, authMiddleware, this.ObjDirectoryController.getAllPOsForActualReceipt);
    this.router.post(`${this.path}update-actual-receipt-details`, authMiddleware, this.ObjDirectoryController.updateActualReceipt);
    /** */
    this.router.post(`${this.path}get-requisition-list`, authMiddleware, this.ObjDirectoryController.GetReceiptNo);
    this.router.post(`${this.path}save-payment-details`, authMiddleware, this.ObjDirectoryController.savePaymentDetails);

    this.router.post(`${this.path}get-pending-payment-list`, authMiddleware, this.ObjDirectoryController.GetPendingPayment);
    this.router.post(`${this.path}update-payment-details`, authMiddleware, this.ObjDirectoryController.UpdatePaymentDetails);
    this.router.post(`${this.path}save-poa-120`, authMiddleware, this.ObjDirectoryController.savePOA120);
    this.router.post(`${this.path}save-poa-113`, authMiddleware, this.ObjDirectoryController.ttdpur113poa);
  }
}

export default PurchaseActualReceiptsRoute;
