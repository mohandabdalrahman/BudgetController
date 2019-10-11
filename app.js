var budgetController = (function () {

    var Expence = function (id, descrip, value) {
        this.id = id;
        this.descrip = descrip;
        this.value = value;
        this.percentage = -1;
    }

    Expence.prototype.calPercentage = function (totalIncome) {

        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100)
        } else {
            this.percentage = -1
        }

    }

    Expence.prototype.getPercentage = function () {
        return this.percentage
    }
    var Income = function (id, descrip, value) {
        this.id = id;
        this.descrip = descrip;
        this.value = value
    }

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(cur => {
            sum += cur.value
        });
        data.total[type] = sum
    }
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        total: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    return {

        addItem: function (type, des, val) {
            var newItem, id;
            if (data.allItems[type].length > 0) {

                id = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                id = 0
            }
            if (type === 'exp') {
                newItem = new Expence(id, des, val)
            } else {
                newItem = new Income(id, des, val)
            }
            data.allItems[type].push(newItem);
            return newItem
        },

        deleteItem: function (type, id) {

            var ids = [],
                index;
            ids = data.allItems[type].map(current => current.id);
            index = ids.indexOf(id);
            data.allItems[type].slice(index, 1);

        },

        calculateBudget: function () {

            // calculate total income and expense
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget  income-expense
            data.budget = data.total.inc - data.total.exp

            // calculate the percentage of income that we spent
            if (data.total.inc > 0) {
                data.percentage = Math.round((data.total.exp / data.total.inc) * 100)
            } else {
                data.percentage = -1
            }
        },

        calculatePercentage: function () {
            data.allItems.exp.forEach(cur => {
                cur.calPercentage(data.total.inc)
            })
        },

        getPercentage: function () {
            var allPerc = data.allItems.exp.map(cur => cur.getPercentage());
            return allPerc;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.total.inc,
                totalExp: data.total.exp,
                percentage: data.percentage
            }
        },
        testing: function () {
            console.log(data)
        }
    }


})();


var UIController = (function () {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescrip: '.add__description',
        inputValue: '.add__value',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        dateLabel: '.budget__title--month'
    }

    var formatNumber = function (num, type) {

        var numsplit, int, dec;
        num = Math.abs(num);
        num = num.toFixed(2);
        numsplit = num.split('.');
        int = numsplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length)
        }

        dec = numsplit[1]
        return (type === 'exp' ? '-' : '+') + "" + int + '.' + dec

    }

    return {

        inputData: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                descrip: document.querySelector(DOMstrings.inputDescrip).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }

        },
        addListItem: function (obj, type) {

            var html, element;
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = `
                <div class="item clearfix" id="inc-${obj.id}">
                <div class="item__description">${obj.descrip}</div>
                <div class="right clearfix">
                    <div class="item__value">${formatNumber(obj.value,type)}</div>
                    <div class="item__delete">
                        <button class="item__delete--btn"><i  class="ion-ios-close-outline"></i></button>
                    </div>
                </div>
            </div>
                `
            } else {
                element = DOMstrings.expenseContainer;
                html = ` <div class="item clearfix" id="exp-${obj.id}">
                <div class="item__description">${obj.descrip}</div>
                <div class="right clearfix">
                    <div class="item__value">${formatNumber(obj.value,type)} </div>
                    <div class="item__percentage">21%</div>
                    <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                    </div>
                </div>
            </div>`
            }
            document.querySelector(element).insertAdjacentHTML('beforeend', html)
        },

        deleteListItem: function (id) {
            var el = document.getElementById(id);
            el.parentNode.removeChild(el)


        },
        clearFields: function () {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescrip + ',' + DOMstrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(current => {
                current.value = ""
            });
            fieldsArr[0].focus();
        },

        displayBudget: function (obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = "---";
            }
        },

        displayPercentages: function (percentages) {

            document.querySelectorAll('.item__percentage').forEach((item, index) => {
                item.textContent = percentages[index] + "%"
            })
        },
        displayDate: function () {

            var now, month, year;
            now = new Date();
            month = now.getMonth();
            year = now.getFullYear();

            document.querySelector(DOMstrings.dateLabel).textContent = month+1 + " " + year

        },
        changeType:function(){
            document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescrip + ',' +
                DOMstrings.inputValue
            ).forEach(field=>{
                field.classList.toggle('red-focus')
            })

            document.querySelector('.add__btn').classList.toggle('red')
        }

    }

})();



var Controller = (function (budgetCtl, uiCtrl) {

    var setUpEventListeners = function () {
        document.querySelector(".add__btn").addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function (e) {

            if (e.keyCode === 13 || e.which === 13) {
                ctrlAddItem()
            }
        });

        document.querySelector('.container').addEventListener('click', ctrlDeleteItem);
        document.querySelector('.add__type').addEventListener('change',uiCtrl.changeType)
    }

    var updateBudget = function () {
        // calculate the budget
        budgetCtl.calculateBudget()

        // return the budget
        var budget = budgetCtl.getBudget()

        // display budget on ui
        uiCtrl.displayBudget(budget)
    }

    var updatePercentage = function () {

        budgetCtl.calculatePercentage();
        var percentages = budgetCtl.getPercentage();
        uiCtrl.displayPercentages(percentages)
    }

    var ctrlAddItem = function () {
        // get input data
        var input = uiCtrl.inputData()
        if (input.descrip !== "" && !isNaN(input.value) && input.value > 0) {
            var newItem = budgetCtl.addItem(input.type, input.descrip, input.value)
            uiCtrl.addListItem(newItem, input.type);
            uiCtrl.clearFields();
            updateBudget();
            updatePercentage();
        }
    }

    var ctrlDeleteItem = function (e) {

        var itemId, splitId, type, Id;

        itemId = e.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemId) {
            splitId = itemId.split('-');
            type = splitId[0];
            Id = parseInt(splitId[1]);
            budgetCtl.deleteItem(type, Id);
            uiCtrl.deleteListItem(itemId);
            updateBudget();
            updatePercentage();
        }

    }

    return {
        init: function () {
            console.log('Application has started');
            uiCtrl.displayDate();
            uiCtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            })
            setUpEventListeners()
        }
    }


})(budgetController, UIController);

Controller.init()