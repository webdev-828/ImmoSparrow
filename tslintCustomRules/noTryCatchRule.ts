import * as Lint from 'tslint';
import * as ts from 'typescript';

export class Rule extends Lint.Rules.AbstractRule {
  public static FAILURE_STRING = 'don\'t use try {} catch {}';

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new NoTryCatchWalker(sourceFile, this.getOptions()));
  }
}

class NoTryCatchWalker extends Lint.RuleWalker {
  public visitTryStatement(node: ts.TryStatement) {
    this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
    super.visitTryStatement(node);
  }
}
