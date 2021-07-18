// class Tree
class Tree {

    constructor(data) {
        this.data = data;
        this.left = null;
        this.right = null;
    }
}

// getting sums of root to leaf
function leafSumEncoded(root, val) {

    // base
    if (root == null) {
        return 0;
    }

    // update the value 
    val = ((val*10) + root.data);

    // if current node is a leaf, return the current value
    if (root.left == null && root.right == null) {
        console.log(val);
        return val;
    }

    // aggregate left + right subtrees values
    return (
        leafSumEncoded(root.left, val) + leafSumEncoded(root.right, val)
    );
        
}

// a wrapper for leafSumEncoded
function treeSum(root) {
    return leafSumEncoded(root, 0);
}

// ------------ test 1 ------------
let t1 = new Tree(1);

t1.left = new Tree(0);
t1.left.left = new Tree(3);
t1.left.right = new Tree(1);

t1.right = new Tree(4);

console.log("treeSum of t1 : ", treeSum(t1));

// ------------ test 2 ------------

let t2 = new Tree(0);
t2.left = new Tree(9);

t2.right = new Tree(9);
t2.right.left = new Tree(1);
t2.right.right = new Tree(3);

console.log("treeSum of t2 : ", treeSum(t2));




