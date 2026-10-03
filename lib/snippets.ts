export interface Snippet {
  id: string;
  title: string;
  category: 'Starter' | 'Data Structures' | 'Algorithms' | 'Competitive';
  langId: string;
  description: string;
  code: string;
}

export const SNIPPETS: Snippet[] = [
  // PYTHON
  {
    id: 'py-starter',
    title: 'Fast I/O & Starter',
    category: 'Starter',
    langId: 'python',
    description: 'Basic Python starter template with fast I/O setup',
    code: `import sys

def main():
    # Read all lines from STDIN
    input_data = sys.stdin.read().split()
    if not input_data:
        print("Hello, World!")
        return
    
    print(f"Read {len(input_data)} tokens from STDIN.")
    for token in input_data:
        print(f"Token: {token}")

if __name__ == "__main__":
    main()
`
  },
  {
    id: 'py-binary-search-tree',
    title: 'Binary Search Tree',
    category: 'Data Structures',
    langId: 'python',
    description: 'BST insertion, search, and in-order traversal',
    code: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class BST:
    def __init__(self):
        self.root = None

    def insert(self, val):
        if not self.root:
            self.root = TreeNode(val)
            return
        curr = self.root
        while True:
            if val < curr.val:
                if not curr.left:
                    curr.left = TreeNode(val)
                    break
                curr = curr.left
            else:
                if not curr.right:
                    curr.right = TreeNode(val)
                    break
                curr = curr.right

    def inorder(self, root):
        return self.inorder(root.left) + [root.val] + self.inorder(root.right) if root else []

# Demo
bst = BST()
for x in [5, 3, 7, 2, 4, 6, 8]:
    bst.insert(x)

print("In-order Traversal:", bst.inorder(bst.root))
`
  },
  {
    id: 'py-bfs-dfs',
    title: 'Graph BFS & DFS',
    category: 'Algorithms',
    langId: 'python',
    description: 'Breadth-First and Depth-First Graph Traversal',
    code: `from collections import deque

graph = {
    'A': ['B', 'C'],
    'B': ['D', 'E'],
    'C': ['F'],
    'D': [],
    'E': ['F'],
    'F': []
}

def bfs(start):
    visited = set([start])
    queue = deque([start])
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return order

def dfs(node, visited=None):
    if visited is None:
        visited = set()
    visited.add(node)
    res = [node]
    for neighbor in graph[node]:
        if neighbor not in visited:
            res.extend(dfs(neighbor, visited))
    return res

print("BFS Order:", bfs('A'))
print("DFS Order:", dfs('A'))
`
  },
  {
    id: 'py-knapsack',
    title: '0/1 Knapsack Dynamic Programming',
    category: 'Algorithms',
    langId: 'python',
    description: 'Classic DP solution for 0/1 Knapsack problem',
    code: `def knapsack(weights, values, capacity):
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]

    for i in range(1, n + 1):
        for w in range(1, capacity + 1):
            if weights[i - 1] <= w:
                dp[i][w] = max(values[i - 1] + dp[i - 1][w - weights[i - 1]], dp[i - 1][w])
            else:
                dp[i][w] = dp[i - 1][w]

    return dp[n][capacity]

# Demo
weights = [2, 3, 4, 5]
values = [3, 4, 5, 6]
capacity = 5
print("Max Value in Knapsack:", knapsack(weights, values, capacity))
`
  },

  // C++
  {
    id: 'cpp-starter',
    title: 'Competitive Programming Template',
    category: 'Competitive',
    langId: 'cpp',
    description: 'Fast I/O template for C++ competitive programming',
    code: `#include <bits/stdc++.h>
using namespace std;

void solve() {
    string input;
    if (cin >> input) {
        cout << "Received STDIN input: " << input << "\n";
    } else {
        cout << "Hello from C++ UniCompile!\n";
    }
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    solve();
    return 0;
}
`
  },
  {
    id: 'cpp-quicksort',
    title: 'QuickSort Algorithm',
    category: 'Algorithms',
    langId: 'cpp',
    description: 'In-place QuickSort implementation in C++',
    code: `#include <iostream>
#include <vector>
#include <algorithm>

int partition(std::vector<int>& arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            std::swap(arr[i], arr[j]);
        }
    }
    std::swap(arr[i + 1], arr[high]);
    return i + 1;
}

void quickSort(std::vector<int>& arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}

int main() {
    std::vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
    quickSort(arr, 0, arr.size() - 1);
    
    std::cout << "Sorted array: ";
    for (int x : arr) std::cout << x << " ";
    std::cout << "\n";
    return 0;
}
`
  },

  // C#
  {
    id: 'csharp-starter',
    title: 'C# Program Template',
    category: 'Starter',
    langId: 'csharp',
    description: 'C# Program class with Console reading and writing',
    code: `using System;
using System.Collections.Generic;

namespace UniCompileApp {
    class Program {
        static void Main(string[] args) {
            Console.WriteLine("=== C# UniCompile Starter ===");
            
            string line = Console.ReadLine();
            if (!string.IsNullOrEmpty(line)) {
                Console.WriteLine($"STDIN received: {line}");
            } else {
                Console.WriteLine("No STDIN input detected.");
            }
        }
    }
}
`
  },

  // JAVASCRIPT
  {
    id: 'js-async-fetch',
    title: 'Async/Await & Promises',
    category: 'Algorithms',
    langId: 'javascript',
    description: 'Asynchronous task execution using Promises',
    code: `const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runPipeline() {
  console.log("Starting async pipeline...");
  await delay(100);
  console.log("Step 1 Complete ✓");
  await delay(100);
  console.log("Step 2 Complete ✓");
  console.log("Pipeline Finished Successfully!");
}

runPipeline();
`
  },

  // JAVA
  {
    id: 'java-starter',
    title: 'Java Main Class & Scanner',
    category: 'Starter',
    langId: 'java',
    description: 'Java class setup with Scanner for STDIN reading',
    code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.println("Java UniCompile Engine Ready!");
        
        if (scanner.hasNextLine()) {
            String line = scanner.nextLine();
            System.out.println("Read STDIN: " + line);
        } else {
            System.out.println("Tip: Supply custom input in the STDIN tab below!");
        }
        scanner.close();
    }
}
`
  },

  // GO
  {
    id: 'go-goroutines',
    title: 'Go Goroutines & Channels',
    category: 'Algorithms',
    langId: 'go',
    description: 'Concurrent execution using Go channels',
    code: `package main

import (
	"fmt"
	"sync"
)

func worker(id int, wg *sync.WaitGroup, ch chan<- string) {
	defer wg.Done()
	ch <- fmt.Sprintf("Worker %d completed task", id)
}

func main() {
	var wg sync.WaitGroup
	ch := make(chan string, 3)

	for i := 1; i <= 3; i++ {
		wg.Add(1)
		go worker(i, &wg, ch)
	}

	wg.Wait()
	close(ch)

	for res := range ch {
		fmt.Println(res)
	}
}
`
  },

  // RUST
  {
    id: 'rust-starter',
    title: 'Rust Ownership & Vectors',
    category: 'Starter',
    langId: 'rust',
    description: 'Rust vectors, iterators, and ownership pattern',
    code: `fn main() {
    let numbers = vec![1, 2, 3, 4, 5];
    let squared: Vec<i32> = numbers.iter().map(|x| x * x).collect();
    
    println!("Original: {:?}", numbers);
    println!("Squared:  {:?}", squared);
}
`
  }
];
