
// Budget Controller
var budgetController = (function (){
    
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum = sum + cur.value;
        });

        data.totals[type] = sum;
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        }, 
        
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItems: function(type, des, val) {
            var newItem, id;

            // [1 2 3 4 5], next ID = 6
            // [1 2 4 6 8], next ID = 9
            if(data.allItems[type].length > 0){
                id = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                id = 0;
            }

            // Create new items based on 'inc' and 'exp' type
            if(type === 'exp') {
                newItem = new Expense(id, des, val);
            } else if(type === 'inc'){
                newItem = new Income(id, des, val);
            }

            // Push it into our data structure
            data.allItems[type].push(newItem);

            // Return the element
            return newItem;
        },

        calculateBudget: function() {
            
            // Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate the budget: income - expenses
            data.budget = (data.totals.inc - data.totals.exp);

            // Calculate the percentage
            data.percentage = Math.floor((data.totals.exp / data.totals.inc) * 100);

        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function() {
            console.log(data);
        }
    };


})();


//UI Controller
var UIControlller = (function() {

    var DOMstrings = {
        input_type: '.add__type',
        input_description: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add_btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage'
    };
    
    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.input_type).value,
                description: document.querySelector(DOMstrings.input_description).value,
                value: parseInt(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        addListItem: function(obj, type) {
            var html, newHtml, element, d1;
            
            // Create HTML string with placeholder text
            if(type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="income-%d%"> <div class="item__description">%descript%</div> <div class="right clearfix"> <div class="item__value">+%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div></div>'
            } else if(type === 'exp'){ 
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="expense-%d%"> <div class="item__description">%descript%</div> <div class="right clearfix"> <div class="item__value">-%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>'
            }

            // Replace the placeholder text with actual data
            newHtml = html.replace('%d%', obj.id);
            newHtml = newHtml.replace('%descript%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);
            
            // Insert HTML to DOM
            d1 = document.querySelector(element);
            d1.insertAdjacentHTML('beforeend', newHtml);

        },

        clearFields: function() {
            var fields, fieldsArray;
            fields = document.querySelectorAll(DOMstrings.input_description + ', ' +  DOMstrings.inputValue);

            fieldsArray = Array.prototype.slice.call(fields);

            fields.forEach(function(current, index, array) {
                current.value = ""; 
            });

            fieldsArray[0].focus();

        },

        display: function(obj) {
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expenseLabel).textContent = obj.totalExp;

            if(obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';

            }
        },

        getDOMstrings: function() {
            return DOMstrings;
        }
    }

})();


// Global App Controller
var controller = (function(budgetCtrl, uiCtrl){

    var setupEventListeners = function() {
        document.querySelector('.add__btn').addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event) {
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem(); 
            }
        });
    };
   
    var ctrlAddItem = function() {
        var input, newItem;
        
        // 1. Get the filled input field
        input = uiCtrl.getInput();


        if(input.description !== "" && input.value > 0 ){
            
            // 2. Add the item to the budget controller
            newItem = budgetController.addItems(input.type, input.description, input.value);

            // 3. Add the item to the UI 
            uiCtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            uiCtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();
        } else {
            console.log("This is error");
        }
         
            
    };

    var updateBudget = function() {
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        uiCtrl.display(budget);
    };

    return {
        init : function() {
            console.log("Application started.");
            uiCtrl.display({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }
})(budgetController, UIControlller);


controller.init(); 