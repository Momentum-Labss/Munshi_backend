
type precedenceType = "+" | "-" | "*" | "/"
function calcuate(x: number, y : number, operator : precedenceType) {
    if(operator === "+") return x + y
    else if(operator === "-") return x - y
    else if(operator === "*") return x * y
    else return x / y
}


function InfixEvaluation(str : string) : number {
    const infixArray = str.trim().split(/([+-/*])/)
    const operatorStack : precedenceType[] = []
    const operandStack : number[] = []

    const precedence = {"/" : 4, "*" : 3, "+" : 2, "-" : 1}

    for(let i = 0; i < infixArray.length; i++){
        console.log(infixArray[i]!.match(/[+-/*]/))
        if(infixArray[i]!.match(/[+-/*]/)){
            const top = operatorStack[operatorStack.length - 1]! 
            if(operandStack.length >= 2){
                if(precedence[top] >= precedence[infixArray[i] as precedenceType]){
                    const operator = operatorStack.pop()
                    const operand1 = operandStack.pop()
                    const operand2 = operandStack.pop()
                    const total = calcuate(operand2!,operand1!,operator!)
                    operandStack.push(total)
                }
            }
            operatorStack.push(infixArray[i]! as precedenceType)
        }else{
            operandStack.push(parseInt(infixArray[i]!))
        }
    }

    while(operatorStack.length > 0) {
        const operator = operatorStack.pop()
        const operand1 = operandStack.pop()
        const operand2 = operandStack.pop()
        const total = calcuate(operand2!,operand1!,operator!)
        operandStack.push(total)
    }
    return operandStack.pop() ?? 0

}



