// Queue DS
// Queue is a linear data structure which follows a particular order
// in which the operations are performed. The order is First In First Out (FIFO).
// A good example of queue is any queue of consumers for a resource where the consumer
// that came first is served first. The difference between stacks and queues is in removing.
// In a stack we remove the item the most recently added; in a queue,
// we remove the item the least recently added.

// Node
class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

// Queue
class Queue {
    constructor() {
        this.front = null;
        this.rear = null;
        this.size = 0;
    }

    // Enqueue
    enqueue(data) {
        let node = new Node(data);
        if (this.front == null) {
            this.front = node;
        } else {
            this.rear.next = node;
        }
        this.rear = node;
        this.size++;
    }

    // Dequeue
    dequeue() {
        if (this.front == null) {
            return null;
        }
        let data = this.front.data;
        this.front = this.front.next;
        this.size--;
        return data;
    }

    // Front
    front() {
        if (this.front == null) {
            return null;
        }
        return this.front.data;
    }

    // Rear
    rear() {
        if (this.rear == null) {
            return null;
        }
        return this.rear.data;
    }

    // Size
    size() {
        return this.size;
    }

    // isEmpty
    isEmpty() {
        return this.size == 0;
    }

    // All elements
    all() {
        let elements = [];
        let current = this.front;
        while (current != null) {
            elements.push(current.data);
            current = current.next;
        }
        return elements;
    }

    // Clear
    clear() {
        this.front = null;
        this.rear = null;
        this.size = 0;
    }

    // remove element from nth position
    removeAt(index) {
        if (index < 0 || index >= this.size) {
            return null;
        }
        if (index == 0) {
            return this.dequeue();
        }
        let current = this.front;
        let previous = null;
        let i = 0;
        while (i < index) {
            previous = current;
            current = current.next;
            i++;
        }
        previous.next = current.next;
        this.size--;
        return current.data;
    }
}

const queue = new Queue();
queue.enqueue({
    id: 1,
});
queue.enqueue({
    id: 2,
});
queue.enqueue({
    id: 3,
});

console.log(queue.all());
console.log(queue.removeAt(1));
console.log(queue.all());
