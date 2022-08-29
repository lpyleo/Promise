// 自定义Promise
function Promise(executor) {
    // 添加属性
    this.PromiseState = "pending";
    this.PromiseResult = null;
    this.callbacks = [];
    const self = this;
    // 定义resolve函数
    function resolve(data) {
        // 判断状态，使得状态只能改变一次
        if (self.PromiseState !== "pending") return;
        // 修改对象状态（PromiseState）
        self.PromiseState = "fulfilled";
        // 修改对象结果值（PromiseResult）
        self.PromiseResult = data;
        // 调用成功的回调函数
        setTimeout(() => {
            self.callbacks.forEach(item => {
                item.onResolved(data);
            });
        });
    }
    // 定义reject函数
    function reject(data) {
        // 判断状态，使得状态只能改变一次
        if (self.PromiseState !== "pending") return;
        // 修改对象状态（PromiseState）
        self.PromiseState = "rejected";
        // 修改对象结果值（PromiseResult）
        self.PromiseResult = data;
        // 调用失败的回调函数
        setTimeout(() => {
            self.callbacks.forEach(item => {
                item.onRejected(data);
            });
        });

    }
    // 同步调用，通过try-catch实现throw抛出异常
    try {
        executor(resolve, reject);
    } catch (error) {
        reject(error)
    }
}

// 添加then方法
Promise.prototype.then = function (onResolved, onRejected) {
    const self = this;
    // 判断回调函数参数
    if (typeof onRejected !== 'function') {
        onRejected = reason => {
            throw reason;
        }
    }
    if (typeof onResolved !== 'function') {
        onResolved = value => value;
    }
    return new Promise((resolve, reject) => {
        // 封装函数
        function callback(type) {
            try {
                // 获取回调函数的执行结果
                let result = type(self.PromiseResult);
                // 判断结果是否为Promise类型的对象
                if (result instanceof Promise) {
                    result.then(value => {
                        resolve(value);
                    }, reason => {
                        reject(reason);
                    });
                } else {
                    resolve(result);
                }
            } catch (error) {
                // 抛出异常则返回失败状态
                reject(error);
            }
        }
        // 调用回调函数
        if (this.PromiseState === "fulfilled") {
            setTimeout(() => {
                callback(onResolved);
            });
        }
        if (this.PromiseState === "rejected") {
            setTimeout(() => {
                callback(onRejected);
            });
        }
        // 判断“pending”状态
        if (this.PromiseState === "pending") {
            this.callbacks.push({
                onResolved: function () {
                    callback(onResolved);
                },
                onRejected: function () {
                    callback(onRejected);
                }
            });
        }
    })
}

// 添加catch方法
Promise.prototype.catch = function (onRejected) {
    return this.then(undefined, onRejected)
}

// 添加resolve方法（该方法属于Promise函数对象，不属于实例对象，调用时用Promise.resolve调用,所以不能添加在原型中）
Promise.resolve = function (value) {
    return new Promise((resolve, reject) => {
        if (value instanceof Promise) {
            value.then(value => {
                resolve(value);
            }, reason => {
                reject(reason);
            })
        } else {
            resolve(value);
        }
    })
}

// 添加reject方法
Promise.reject = function (reason) {
    return new Promise((resolve, reject) => {
        reject(reason);
    })
}

// 添加all方法
Promise.all = function (promises) {
    // 声明变量
    let count = 0;
    let arr = [];
    return new Promise((resolve, reject) => {
        for (let i = 0; i < promises.length; i++) {
            promises[i].then(value => {
                // count为Promise对象成功的数量
                count++;
                // 将每次成功的值存入数组
                arr[i] = value;
                // 当count等于Promise对象的个数时，改变状态
                if (count === promises.length) {
                    resolve(arr);
                }
            }, reason => {
                reject(reason);
            })
        }
    })
}

// 添加race方法
Promise.race = function (promises) {
    return new Promise((resolve, reject) => {
        for (let i = 0; i < promises.length; i++) {
            promises[i].then(value => {
                resolve(value);
            }, reason => {
                reject(reason);
            })
        }
    })
}