import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Picker } from '@react-native-picker/picker';

const App = () => {
  // 선택된 날짜와 할 일, 우선순위 등의 상태 변수를 관리하기 위한 useState 훅을 사용합니다.
  const [selectedDate, setSelectedDate] = useState(''); // 선택된 날짜
  const [todos, setTodos] = useState({}); // 할 일 목록
  const [todoText, setTodoText] = useState(''); // 새로운 할 일 텍스트
  const [todoPriority, setTodoPriority] = useState('낮음'); // 새로운 할 일 우선순위
  const [modalVisible, setModalVisible] = useState(false); // 모달의 가시성 상태
  const [editingTodoIndex, setEditingTodoIndex] = useState(-1); // 수정 중인 할 일 인덱스
  const [completedTodos, setCompletedTodos] = useState({}); // 완료된 할 일 목록

  const handleDateSelect = (date) => {
    setSelectedDate(date.dateString);
  };

  const handleAddTodo = () => {
    if (selectedDate && todoText) {
      const newTodo = { text: todoText, priority: todoPriority };
      if (editingTodoIndex !== -1) {
        // 수정 중인 할 일을 업데이트합니다.
        const updatedTodos = [...todos[selectedDate]];
        updatedTodos[editingTodoIndex] = newTodo;
        setTodos((prevTodos) => ({
          ...prevTodos,
          [selectedDate]: updatedTodos,
        }));
        setEditingTodoIndex(-1);
      } else {
        // 새로운 할 일을 추가합니다.
        setTodos((prevTodos) => ({
          ...prevTodos,
          [selectedDate]: [...(prevTodos[selectedDate] || []), newTodo],
        }));
      }
      setTodoText('');
      setModalVisible(false);
    }
  };

  const handleEditTodo = (index) => {
    // 할 일 수정 모달을 열고, 수정할 할 일의 정보를 설정합니다.
    setEditingTodoIndex(index);
    setTodoText(todos[selectedDate][index].text);
    setTodoPriority(todos[selectedDate][index].priority);
    setModalVisible(true);
  };

  const handleDeleteTodo = (index) => {
    // 할 일을 삭제합니다.
    const updatedTodos = [...todos[selectedDate]];
    updatedTodos.splice(index, 1);
    if (updatedTodos.length === 0) {
      const updatedTodoObj = { ...todos };
      delete updatedTodoObj[selectedDate];
      setTodos(updatedTodoObj);
    } else {
      setTodos((prevTodos) => ({
        ...prevTodos,
        [selectedDate]: updatedTodos,
      }));
    }
  };

  const handleToggleComplete = (todo, index) => {
    // 할 일의 완료 상태를 변경하고, 완료된 할 일은 목록의 맨 뒤로 이동시킵니다.
    const currentDateCompletedTodos = completedTodos[selectedDate] || [];
    const currentDateTodos = [...todos[selectedDate]];

    if (currentDateCompletedTodos.find((item) => item.text === todo.text && item.priority === todo.priority)) {
      // 이미 완료된 할 일인 경우, 완료 목록에서 제거합니다.
      setCompletedTodos((prevCompletedTodos) => ({
        ...prevCompletedTodos,
        [selectedDate]: currentDateCompletedTodos.filter((item) => !(item.text === todo.text && item.priority === todo.priority)),
      }));
    } else {
      // 완료되지 않은 할 일인 경우, 완료 목록에 추가하고 목록의 맨 뒤로 이동시킵니다.
      setCompletedTodos((prevCompletedTodos) => ({
        ...prevCompletedTodos,
        [selectedDate]: [...currentDateCompletedTodos, todo],
      }));

      currentDateTodos.splice(index, 1);
      currentDateTodos.push(todo);
      setTodos((prevTodos) => ({
        ...prevTodos,
        [selectedDate]: currentDateTodos,
      }));
    }
  };

  // 완료된 날짜를 마크하기 위한 객체를 생성합니다.
  const completedDates = Object.keys(todos).reduce((obj, date) => {
    if (
      todos[date].length &&
      completedTodos[date] &&
      todos[date].length === completedTodos[date].length
    ) {
      obj[date] = { marked: true, dotColor: 'red' }; // 완료된 날짜는 빨간색으로 마크
    }
    return obj;
  }, {});

  // 미완료된 날짜를 마크하기 위한 객체를 생성합니다.
  const incompletedDates = Object.keys(todos).reduce((obj, date) => {
    if (
      !todos[date].length ||
      !completedTodos[date] ||
      todos[date].length !== completedTodos[date].length
    ) {
      obj[date] = { marked: true, dotColor: 'skyblue' }; // 미완료된 날짜는 파란색으로 마크
    }
    return obj;
  }, {});

  // 모든 마크된 날짜를 통합합니다.
  const markedDates = {
    ...incompletedDates,
    ...completedDates,
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={handleDateSelect}
        markedDates={markedDates}
        markingType="simple"
      />

      {selectedDate && (
        <View style={styles.todoContainer}>
          <Text style={styles.selectedDate}>{selectedDate}</Text>

          {todos[selectedDate] && todos[selectedDate].length > 0 ? (
            <View>
              <Text>할 일</Text>
              {todos[selectedDate]
                .filter((todo) => !completedTodos[selectedDate] || !completedTodos[selectedDate].find((item) => item.text === todo.text && item.priority === todo.priority))
                .map((todo, index) => (
                  <TodoItem key={index} todo={todo} index={index} completed={false} handleToggleComplete={handleToggleComplete} handleEditTodo={handleEditTodo} handleDeleteTodo={handleDeleteTodo} />
                ))}
              
              <Text>완료된 일</Text>
              {todos[selectedDate]
                .filter((todo) => completedTodos[selectedDate] && completedTodos[selectedDate].find((item) => item.text === todo.text && item.priority === todo.priority))
                .map((todo, index) => (
                  <TodoItem key={index} todo={todo} index={index} completed={true} handleToggleComplete={handleToggleComplete} handleEditTodo={handleEditTodo} handleDeleteTodo={handleDeleteTodo} />
                ))}
            </View>
          ) : (
            <Text style={styles.noTodosText}>No todos for this date</Text>
          )}
        </View>
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setEditingTodoIndex(-1);
          setModalVisible(true);
        }}
      >
        <Icon name="plus" size={20} color="white" />
      </TouchableOpacity>

      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter todo"
            value={todoText}
            onChangeText={(text) => setTodoText(text)}
          />
          <Text>중요도 : </Text>
          <Picker
            style={{ height: 40, width: '100%' }}
            selectedValue={todoPriority}
            onValueChange={(itemValue, itemIndex) =>
              setTodoPriority(itemValue)
            }>
            <Picker.Item label="낮음" value="낮음" />
            <Picker.Item label="중간" value="중간" />
            <Picker.Item label="높음" value="높음" />
          </Picker>
        

          <TouchableOpacity style={styles.saveButton} onPress={handleAddTodo}>
            <Text style={styles.saveButtonText}>
              {editingTodoIndex !== -1 ? 'Save' : 'Add'}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const TodoItem = ({ todo, index, completed, handleToggleComplete, handleEditTodo, handleDeleteTodo }) => {
  let priorityStyle = {};
  switch(todo.priority) {
    case '높음':
      priorityStyle = { color: 'red' };
      break;
    case '중간':
      priorityStyle = { color: 'yellow' };
      break;
    case '낮음':
      priorityStyle = { color: 'green' };
      break;
    default:
      break;
  }

  return (
    <View style={styles.todoItem}>
      <TouchableOpacity
        style={[
          styles.checkbox,
          completed && styles.checkedCheckbox,
        ]}
        onPress={() => handleToggleComplete(todo, index)}
      >
        {completed && (
          <Icon name="check" size={15} color="white" />
        )}
      </TouchableOpacity>
      <Text>{"중요도:"}</Text>
      <Text style={[styles.todoPriority, priorityStyle]}>{todo.priority}</Text>

      <Text
        style={[
          styles.todoText,
          completed && styles.completedTodoText,
        ]}
      >
        {todo.text}
      </Text>

      {!completed && (
        <>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEditTodo(index)}
          >
            <Icon name="pencil" size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteTodo(index)}
          >
            <Icon name="trash" size={20} color="white" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'lightgrey',
    flex: 1,
    paddingTop: 50,
  },
  todoContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  selectedDate: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'black',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedCheckbox: {
    backgroundColor: 'blue',
    borderColor: 'blue',
  },
  todoText: {
    flex: 1,
    marginRight: 10,
  },
  completedTodoText: {
    textDecorationLine: 'line-through',
  },
  editButton: {
    backgroundColor: 'blue',
    padding: 5,
    borderRadius: 5,
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 5,
  },
  noTodosText: {
    fontStyle: 'italic',
  },
  addButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'blue',
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  saveButton: {
    marginTop: 20,
    width: 40,
    backgroundColor: 'blue',
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  todoPriority: {
    marginRight: 10, // 추가된 부분
  },
});

export default App;
