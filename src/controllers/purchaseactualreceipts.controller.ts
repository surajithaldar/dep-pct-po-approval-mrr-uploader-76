import { NextFunction, Response } from 'express';
import DirectoryService from '@/services/purchaseactualreceipts.service';
import { RequestWithUser } from '@interfaces/auth.interface';

class PurchaseActualReceiptsController {
  public objDirectoryService = new DirectoryService();

  public getAllPOs = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.objDirectoryService.getAllPOs();

      res.status(200).json({
        data,
        message: 'PoList',
        status: true,
      });
    } catch (error) {
      next(error);
    }
  };

  public getAllPOsForActualReceipt = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.objDirectoryService.getAllPOsForActualReceipt();

      res.status(200).json({
        data,
        message: 'PoList',
        status: true,
      });
    } catch (error) {
      next(error);
    }
  };
  public updateActualReceipt = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.objDirectoryService.updateActualReceipt(req.body);
      res.status(200).json({
        data,
        message: 'PoList',
        status: true,
      });
    } catch (error) {
      next(error);
    }
  };

  public GetReceiptNo = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.objDirectoryService.GetReceiptNo();
      res.status(200).json({
        data,
        message: 'RequisitionList',
        status: true,
      });
    } catch (error) {
      next(error);
    }
  };

  public savePaymentDetails = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      // console.log(req.body);
 
      const data = await this.objDirectoryService.savePaymentDetails(req.body);
      res.status(200).json({
        data,
        message: 'saved',
        status: true,
      });
    } catch (error) {
      next(error);
    }
  };
  public GetPendingPayment = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.objDirectoryService.GetPendingPayment();
      res.status(200).json({
        data,
        message: 'PendingRequisitionList',
        status: true,
      });
    } catch (error) {
      next(error);
    }
  };

  public UpdatePaymentDetails = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.objDirectoryService.UpdatePaymentDetails(req.body);
      res.status(200).json({
        data,
        message: 'Update',
        status: true,
      });
    } catch (error) {
      next(error);
    }
  };
   /****************************************************************** */
   public savePOA120 = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.objDirectoryService.savePOA120(req.body);
      res.status(200).json({
        data,
        message: 'inserted',
        status: true,
      });
    } catch (error) {
      next(error);
    }
  };
  public ttdpur113poa = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.objDirectoryService.ttdpur113poa(req.body);
      res.status(200).json({
        data,
        message: 'inserted',
        status: true,
      });
    } catch (error) {
      next(error);
    }
  };
}
export default PurchaseActualReceiptsController;
