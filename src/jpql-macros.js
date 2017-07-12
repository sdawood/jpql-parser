module.exports = {
  identifier: "[a-zA-Z_]+[a-zA-Z0-9_]*",
  identifierStart: "[a-zA-Z_]+",
  identifierPart: "[a-zA-Z0-9_]*",
  integer: "-?(?:0|[1-9][0-9]*)",
  qq_string: "\"(?:\\\\[\"bfnrt/\\\\]|\\\\u[a-fA-F0-9]{4}|[^\"\\\\])*\"",
  q_string: "'(?:\\\\[\'bfnrt/\\\\]|\\\\u[a-fA-F0-9]{4}|[^\'\\\\])*'",
  tokens: {
    reservedWords: {
      reservedKeywords: 'break(?![a-zA-Z0-9_])|case(?![a-zA-Z0-9_])|catch(?![a-zA-Z0-9_])|continue(?![a-zA-Z0-9_])|debugger(?![a-zA-Z0-9_])|default(?![a-zA-Z0-9_])|delete(?![a-zA-Z0-9_])|do(?![a-zA-Z0-9_])|else(?![a-zA-Z0-9_])|finally(?![a-zA-Z0-9_])|for(?![a-zA-Z0-9_])|function(?![a-zA-Z0-9_])|if(?![a-zA-Z0-9_])|in(?![a-zA-Z0-9_])|instanceof(?![a-zA-Z0-9_])|new(?![a-zA-Z0-9_])|return(?![a-zA-Z0-9_])|switch(?![a-zA-Z0-9_])|this(?![a-zA-Z0-9_])|throw(?![a-zA-Z0-9_])|try(?![a-zA-Z0-9_])|typeof(?![a-zA-Z0-9_])|var(?![a-zA-Z0-9_])|void(?![a-zA-Z0-9_])|while(?![a-zA-Z0-9_])|with(?![a-zA-Z0-9_])|class(?![a-zA-Z0-9_])|const(?![a-zA-Z0-9_])|enum(?![a-zA-Z0-9_])|export(?![a-zA-Z0-9_])|extends(?![a-zA-Z0-9_])|import(?![a-zA-Z0-9_])|super(?![a-zA-Z0-9_])',
      true: "true(?![a-zA-Z0-9_])", //true not followed by identifierPart
      false: "false(?![a-zA-Z0-9_])",
      null: "null(?![a-zA-Z0-9_])",
      undefined: "undefined(?![a-zA-Z0-9_])",
      /**group_valid*/
      break: 'break(?![a-zA-Z0-9_])',
      case: 'case(?![a-zA-Z0-9_])',
      catch: 'catch(?![a-zA-Z0-9_])',
      continue: 'continue(?![a-zA-Z0-9_])',
      debugger: 'debugger(?![a-zA-Z0-9_])',
      default: 'default(?![a-zA-Z0-9_])',
      delete: 'delete(?![a-zA-Z0-9_])',
      do: 'do(?![a-zA-Z0-9_])',
      else: 'else(?![a-zA-Z0-9_])',
      finally: 'finally(?![a-zA-Z0-9_])',
      for: 'for(?![a-zA-Z0-9_])',
      function: 'function(?![a-zA-Z0-9_])',
      if: 'if(?![a-zA-Z0-9_])',
      in: 'in(?![a-zA-Z0-9_])',
      instanceof: 'instanceof(?![a-zA-Z0-9_])',
      new: 'new(?![a-zA-Z0-9_])',
      return: 'return(?![a-zA-Z0-9_])',
      switch: 'switch(?![a-zA-Z0-9_])',
      this: 'this(?![a-zA-Z0-9_])',
      throw: 'throw(?![a-zA-Z0-9_])',
      try: 'try(?![a-zA-Z0-9_])',
      typeof: 'typeof(?![a-zA-Z0-9_])',
      var: 'var(?![a-zA-Z0-9_])',
      void: 'void(?![a-zA-Z0-9_])',
      while: 'while(?![a-zA-Z0-9_])',
      with: 'with(?![a-zA-Z0-9_])',
      class: 'class(?![a-zA-Z0-9_])',
      const: 'const(?![a-zA-Z0-9_])',
      enum: 'enum(?![a-zA-Z0-9_])',
      export: 'export(?![a-zA-Z0-9_])',
      extends: 'extends(?![a-zA-Z0-9_])',
      import: 'import(?![a-zA-Z0-9_])',
      super: 'super(?![a-zA-Z0-9_])'
    }
  },
  
  toActiveScriptExpression: function(activeScriptExpressionToken) {
    return 
"    {" +
"      value: yy.lexer.matches[0]," +
"      map: {" +
"        value: yy.lexer.matches[1]," +
"        tag: yy.lexer.matches[3]," +
"        label: yy.lexer.matches[4]," +
"        async: yy.lexer.matches[16]," +
"        take: yy.lexer.matches[18]," +
"        operation: yy.lexer.matches[23]," +
"        script: yy.lexer.matches[24]" +
"      }," +
"      reduce: {" +
"        value: yy.lexer.matches[13]," +
"        tag: yy.lexer.matches[28]," +
"        label: yy.lexer.matches[29]," +
"        async: yy.lexer.matches[31]," +
"        take: yy.lexer.matches[33]," +
"        operation: yy.lexer.matches[48]," +
"        script: yy.lexer.matches[49]" +
"      }" +
"    }"
  },

};
