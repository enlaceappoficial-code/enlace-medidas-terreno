import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { colors } from '../theme/colors';

export default function ToolsStandardCalcScreen() {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [isScientific, setIsScientific] = useState(false);

  // Helper para calcular factorial
  const factorial = (n: number): number => {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  };

  const handlePress = (val: string) => {
    if (val === 'AC') {
      setExpression('');
      setResult('');
    } else if (val === '⌫') {
      setExpression(prev => prev.slice(0, -1));
    } else if (val === '=') {
      try {
        let parsed = expression
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/π/g, 'Math.PI')
          .replace(/√\(/g, 'Math.sqrt(')
          .replace(/sin\(/g, 'Math.sin(')
          .replace(/cos\(/g, 'Math.cos(')
          .replace(/tan\(/g, 'Math.tan(')
          .replace(/log\(/g, 'Math.log10(')
          .replace(/\^/g, '**')
          .replace(/%/g, '/100');

        // Manejo ultra básico de factorial (solo números enteros antes del !)
        parsed = parsed.replace(/(\d+)!/g, 'factorial($1)');

        // eslint-disable-next-line no-new-func
        const calc = new Function('factorial', 'return ' + parsed)(factorial);
        
        // Redondear a 6 decimales para evitar errores de precisión JS
        const finalResult = Math.round(calc * 1000000) / 1000000;
        setResult(finalResult.toString());
      } catch (e) {
        setResult('Error');
      }
    } else if (['sin', 'cos', 'tan', 'log', '√'].includes(val)) {
      setExpression(prev => prev + val + '(');
    } else if (val === '( )') {
      // Lógica simple para cerrar paréntesis si hay uno abierto
      const openParens = (expression.match(/\(/g) || []).length;
      const closeParens = (expression.match(/\)/g) || []).length;
      if (openParens > closeParens) {
        setExpression(prev => prev + ')');
      } else {
        setExpression(prev => prev + '(');
      }
    } else {
      setExpression(prev => prev + val);
    }
  };

  const basicButtons = [
    ['AC', '( )', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '⌫', '=']
  ];

  const scientificButtons = [
    ['√', 'π', '^', '!'],
    ['sin', 'cos', 'tan', 'log']
  ];

  const renderRow = (row: string[]) => (
    <View style={styles.row} key={row.join('')}>
      {row.map((btn) => {
        const isOperator = ['÷', '×', '-', '+', '='].includes(btn);
        const isAction = ['AC', '( )', '%', '⌫'].includes(btn);
        const isSci = scientificButtons.flat().includes(btn);
        
        return (
          <TouchableOpacity 
            key={btn} 
            style={[
              styles.button, 
              isOperator && styles.operatorButton,
              isAction && styles.actionButton,
              isSci && styles.sciButton
            ]} 
            onPress={() => handlePress(btn)}
          >
            <Text style={[
              styles.buttonText, 
              (isOperator || isAction) && styles.operatorButtonText,
              isSci && styles.sciButtonText
            ]}>{btn}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.displayContainer}>
        <ScrollView horizontal contentContainerStyle={{flexGrow: 1, justifyContent: 'flex-end'}} showsHorizontalScrollIndicator={false}>
          <Text style={styles.expressionText}>{expression}</Text>
        </ScrollView>
        <Text style={styles.resultText} numberOfLines={1} adjustsFontSizeToFit>{result}</Text>
      </View>
      
      <TouchableOpacity style={styles.toggleBar} onPress={() => setIsScientific(!isScientific)}>
        <Text style={styles.toggleIcon}>{isScientific ? '▼' : '▲'}</Text>
      </TouchableOpacity>

      <View style={styles.buttonsContainer}>
        {isScientific && scientificButtons.map(renderRow)}
        {basicButtons.map(renderRow)}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  displayContainer: {
    flex: 0.35,
    backgroundColor: colors.card,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  expressionText: {
    fontSize: 32,
    color: colors.textLight,
    marginBottom: 8,
    minHeight: 40,
  },
  resultText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
  },
  toggleBar: {
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: colors.background,
  },
  toggleIcon: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    flex: 0.65,
    paddingHorizontal: 16,
    paddingBottom: 24,
    justifyContent: 'flex-end',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  button: {
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  operatorButton: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  actionButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sciButton: {
    backgroundColor: '#334155', // Un tono más oscuro para funciones científicas
    borderColor: '#334155',
    height: 60, // Ligeramente más achatados para que quepan mejor
    borderRadius: 30,
  },
  buttonText: {
    fontSize: 28,
    color: colors.text,
    fontWeight: '500',
  },
  operatorButtonText: {
    color: '#fff',
  },
  sciButtonText: {
    color: '#fff',
    fontSize: 20,
  }
});
