const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const TASKS_FILE_PATH = 'tasks.json';

class Task {
  constructor(title, description, deadline) {
    this.title = title;
    this.description = description;
    this.deadline = deadline;
    this.completed = false;
    this.completedDate = null;
  }

  complete() {
    this.completed = true;
    this.completedDate = new Date();
  }

  edit(title, description, deadline) {
    this.title = title;
    this.description = description;
    this.deadline = deadline;
  }
}

class TaskManager {
  constructor() {
    this.tasks = [];
  }

  addTask(task) {
    this.tasks.push(task);
  }

  getUndoneTasks() {
    return this.tasks.filter(task => !task.completed);
  }

  getAllTasks() {
    return this.tasks;
  }

  getOverdueTasks() {
    const currentDate = new Date();
    return this.tasks.filter(task => !task.completed && task.deadline < currentDate);
  }

  sortTasksByDeadline(tasks) {
    return tasks.sort((a, b) => a.deadline - b.deadline);
  }

  completeTask(index) {
    const task = this.tasks[index];
    if (task) {
      task.complete();
    }
  }

  editTask(index, title, description, deadline) {
    const task = this.tasks[index];
    if (task) {
      task.edit(title, description, deadline);
    }
  }

  deleteTask(index) {
    this.tasks.splice(index, 1);
  }

  saveTasksToFile() {
    const tasksJson = JSON.stringify(this.tasks);
    fs.writeFileSync(TASKS_FILE_PATH, tasksJson);
    console.log('Tasks saved to file.');
  }

  loadTasksFromFile() {
    try {
      const tasksJson = fs.readFileSync(TASKS_FILE_PATH, 'utf8');
      const tasksData = JSON.parse(tasksJson);
      this.tasks = tasksData.map(task => {
        const loadedTask = new Task(task.title, task.description, new Date(task.deadline));
        loadedTask.completed = task.completed;
        loadedTask.completedDate = task.completedDate ? new Date(task.completedDate) : null;
        return loadedTask;
      });
      console.log('Tasks loaded from file.');
    } catch (error) {
      console.log('Error while reading file:', error.message);
    }
  }
}

const taskManager = new TaskManager();

function addTask() {
  rl.question('Enter task title: ', (title) => {
    rl.question('Enter task description: ', (description) => {
      rl.question('Enter task deadline (yyyy-mm-dd): ', (deadline) => {
        if (deadline.indexOf('-') !== -1) {
          const checkDl = deadline.split('-');
          if (checkDl[0].length === 4 && checkDl[1].length === 2 && checkDl[2].length === 2) {
            const task = new Task(title, description, new Date(deadline));
            taskManager.addTask(task);
            console.log('Task added.');
          } else console.log('Incorrect value for deadline');
        } else console.log('Incorrect value for deadline');
        showMenu();
      });
    });
  });
}

function editTask() {
  rl.question('Enter the index of the task to edit: ', (index) => {
    const task = taskManager.getAllTasks()[index];
    if (task) {
      rl.question('Enter new task title: ', (title) => {
        rl.question('Enter new task description: ', (description) => {
          rl.question('Enter new task deadline (yyyy-mm-dd): ', (deadline) => {
            if (deadline.indexOf('-') !== -1) {
              const checkDl = deadline.split('-');
              if (checkDl[0].length === 4 && checkDl[1].length === 2 && checkDl[2].length === 2) {
                taskManager.editTask(index, title, description, new Date(deadline));
                console.log('Task edited.');
              } else console.log('Incorrect value for deadline');
            } else console.log('Incorrect value for deadline');
            showMenu();
          });
        });
      });
    } else {
      console.log('Task with the specified index not found.');
      showMenu();
    }
  });
}

function showUndoneTasks() {
  const undoneTasks = taskManager.getUndoneTasks();
  const sortedTasks = taskManager.sortTasksByDeadline(undoneTasks);

  console.log('List of undone tasks:');
  sortedTasks.forEach((task, index) => {
    console.log(`${index}. ${task.title} - Deadline: ${task.deadline}`);
  });

  showMenu();
}

function showAllTasks() {
  const allTasks = taskManager.getAllTasks();

  console.log('List of all tasks:');
  allTasks.forEach((task, index) => {
    const status = task.completed ? 'Completed' : 'Not completed';
    const completedDate = task.completedDate ? task.completedDate.toISOString() : 'Not completed';

    console.log(`${index}. ${task.title} - Deadline: ${task.deadline} - Status: ${status} - Completed Date: ${completedDate}`);
  });

  showMenu();
}

function completeTask() {
  rl.question('Enter the index of the task to mark as completed: ', (index) => {
    const task = taskManager.getAllTasks()[index];
    if (task) {
      taskManager.completeTask(index);
      console.log('Task marked as completed.');
    } else console.log('Task with the specified index not found.');
    showMenu();
  });
}

function deleteTask() {
  rl.question('Enter the index of the task to delete: ', (index) => {
    const task = taskManager.getAllTasks()[index];
    if (task) {
      taskManager.deleteTask(index);
      console.log('Task deleted.');
    } else console.log('Task with the specified index not found.');
    showMenu();
  });
}

function showOverdueTasks() {
  const overdueTasks = taskManager.getOverdueTasks();

  console.log('List of overdue tasks:');
  overdueTasks.forEach((task, index) => {
    console.log(`${index}. ${task.title} - Deadline: ${task.deadline}`);
  });

  showMenu();
}

function showMenu() {
  console.log(
    '\nMenu:'
    + '\n1. Show list of undone tasks'
    + '\n2. Show list of all tasks'
    + '\n3. Mark task as completed'
    + '\n4. Add new task'
    + '\n5. Edit task'
    + '\n6. Show list of overdue tasks'
    + '\n7. Delete task'
    + '\n8. Exit'
  );

  rl.question('Select an option: ', (option) => {
    switch (option) {
      case '1':
        showUndoneTasks();
        break;
      case '2':
        showAllTasks();
        break;
      case '3':
        completeTask();
        break;
      case '4':
        addTask();
        break;
      case '5':
        editTask();
        break;
      case '6':
        showOverdueTasks();
        break;
      case '7':
        deleteTask();
        break;
      case '8':
        exitApp();
        break;
      default:
        console.log('Invalid choice. Please try again.');
        showMenu();
        break;
    }
  });
}

function exitApp() {
  taskManager.saveTasksToFile();
  rl.close();
}

function startApp() {
  taskManager.loadTasksFromFile();
  showMenu();
}

startApp();
