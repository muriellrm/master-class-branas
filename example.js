const sum = function (a, b) {
    return new Promise((resolve,) => {
        setTimeout(() => {
            resolve(a + b);
        }, 1000);
    });
}

function async(fn) {
    const gen = fn();
    asyncR(gen)
}

function asyncR(gen, result){
    const obj = gen.next(result);
    if (obj.done) return;
    obj.value.then(function(result){
        asyncR(gen, result)
    })
}

async(function* () {
    const a = yield sum(2, 2);
    const b = yield sum(4, 4);
    const result = yield sum(a, b);
    console.log(result);
});