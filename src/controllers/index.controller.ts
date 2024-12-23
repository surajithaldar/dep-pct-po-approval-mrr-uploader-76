import { NextFunction, Request, Response } from 'express';

class IndexController {
  public index = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const a: any = { ask: 'Hi' };
      res.json(a);
    } catch (error) {
      next(error);
    }
  };
}

export default IndexController;
