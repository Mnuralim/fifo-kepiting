import { create, all } from "mathjs";

const math = create(all);

export interface RegressionResult {
  coefficients: number[];
  intercept: number;
  weatherCoeff: number;
  productionCostCoeff: number;
  predictions: number[];
  metrics: RegressionMetrics;
}

export interface RegressionMetrics {
  rmse: number;
  rSquared: number;
  mape: number;
  pe: number;
}

export class MultipleLinearRegression {
  private coefficients: number[] = [];
  private trained: boolean = false;

  public train(X: number[][], y: number[]): RegressionResult {
    if (X.length !== y.length) {
      throw new Error("X and y must have the same number of samples");
    }

    if (X.length < 3) {
      throw new Error("Minimum 3 samples required for training");
    }

    const needsIntercept = !X.every((row) => row[0] === 1);
    const XWithIntercept = needsIntercept ? X.map((row) => [1, ...row]) : X;

    this.coefficients = this.calculateCoefficients(XWithIntercept, y);
    this.trained = true;

    const predictions = this.predict(XWithIntercept);
    const metrics = this.calculateMetrics(y, predictions);

    return {
      coefficients: this.coefficients,
      intercept: this.coefficients[0],
      weatherCoeff: this.coefficients[1],
      productionCostCoeff: this.coefficients[2],
      predictions,
      metrics,
    };
  }

  public predict(X: number[][]): number[] {
    if (!this.trained) throw new Error("Model must be trained first");

    const needsIntercept = !X.every((row) => row[0] === 1);
    const XWithIntercept = needsIntercept ? X.map((row) => [1, ...row]) : X;

    return XWithIntercept.map((row) =>
      row.reduce((sum, val, idx) => sum + val * this.coefficients[idx], 0)
    );
  }

  public predictSingle(weatherValue: number, productionCost: number): number {
    if (!this.trained) throw new Error("Model must be trained first");

    return (
      this.coefficients[0] +
      this.coefficients[1] * weatherValue +
      this.coefficients[2] * productionCost
    );
  }

  private calculateCoefficients(X: number[][], y: number[]): number[] {
    const XMatrix = math.matrix(X);
    const yMatrix = math.matrix(y.map((val) => [val]));

    const XT = math.transpose(XMatrix);
    const XTX = math.multiply(XT, XMatrix);
    const XTy = math.multiply(XT, yMatrix);

    const beta = math.lusolve(XTX, XTy);
    return (beta.toArray() as unknown as number[][]).map((row) => row[0]);
  }

  private calculateMetrics(
    actual: number[],
    predicted: number[]
  ): RegressionMetrics {
    const n = actual.length;

    const rmse = Math.sqrt(
      actual.reduce((sum, act, i) => sum + (act - predicted[i]) ** 2, 0) / n
    );

    const yMean = actual.reduce((sum, val) => sum + val, 0) / n;
    const ssTotal = actual.reduce((sum, val) => sum + (val - yMean) ** 2, 0);
    const ssResidual = actual.reduce(
      (sum, act, i) => sum + (act - predicted[i]) ** 2,
      0
    );
    const rSquared = ssTotal === 0 ? 1 : 1 - ssResidual / ssTotal;

    let mapeSum = 0,
      peSum = 0,
      validCount = 0;
    actual.forEach((val, i) => {
      if (val !== 0) {
        mapeSum += Math.abs((val - predicted[i]) / val);
        peSum += (predicted[i] - val) / val;
        validCount++;
      }
    });

    return {
      rmse,
      rSquared,
      mape: validCount > 0 ? (mapeSum / validCount) * 100 : 0,
      pe: validCount > 0 ? (peSum / validCount) * 100 : 0,
    };
  }

  public getCoefficients(): number[] {
    if (!this.trained) throw new Error("Model must be trained");
    return [...this.coefficients];
  }

  public loadCoefficients(coefficients: number[]): void {
    this.coefficients = [...coefficients];
    this.trained = true;
  }

  public isTrained(): boolean {
    return this.trained;
  }

  public reset(): void {
    this.coefficients = [];
    this.trained = false;
  }
}
