import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'customOrderBy',
    pure: false
})
export class CustomOrderByPipe implements PipeTransform {
    transform(value, expression, reverse) {
        if (!value || !expression) {
            return value;
        }
        var isArray = value instanceof Array;
        if (isArray) {
            return this.sortArray(value.slice(), expression, reverse);
        }
        if (typeof value === 'object') {
            return this.transformObject(value, expression, reverse);
        }
        return value;
    }
    sortArray(value, expression, reverse) {
        var array = value.sort(function (a, b) {
            return a[expression] > b[expression] ? 1 : -1;
        });
        if (reverse) {
            return array.reverse();
        }
        return array;
    }
    transformObject(value, expression, reverse) {
        var parsedExpression = CustomOrderByPipe.parseExpression(expression);
        var lastPredicate = parsedExpression.pop();
        var oldValue = CustomOrderByPipe.getValue(value, parsedExpression);
        if (!(oldValue instanceof Array)) {
            parsedExpression.push(lastPredicate);
            lastPredicate = null;
            oldValue = CustomOrderByPipe.getValue(value, parsedExpression);
        }
        if (!oldValue) {
            return value;
        }
        var newValue = this.transform(oldValue, lastPredicate, reverse);
        CustomOrderByPipe.setValue(value, newValue, parsedExpression);
        return value;
    }
    static parseExpression(expression) {
        expression = expression.replace(/\[(\w+)\]/g, '.$1');
        expression = expression.replace(/^\./, '');
        return expression.split('.');
    }
    static getValue(object, expression) {
        for (var i = 0, n = expression.length; i < n; ++i) {
            var k = expression[i];
            if (!(k in object)) {
                return;
            }
            object = object[k];
        }
        return object;
    }
    static setValue(object, value, expression) {
        var i;
        for (i = 0; i < expression.length - 1; i++) {
            object = object[expression[i]];
        }
        object[expression[i]] = value;
    }
}