const STORAGE_KEYS = {
    LIST: 'listData',
    LINKS: 'linksData',
    CHECKBOX: 'checkboxData'
};

class Entity {
    constructor(name, type, items) {
        this.name = name;
        this.type = type;
        this.items = items;
    }

    save() {
        localStorage.setItem(STORAGE_KEYS[this.type], JSON.stringify(this.items));
    }

    static load(type) {
        const data = localStorage.getItem(STORAGE_KEYS[type]);
        return data ? JSON.parse(data) : [];
    }
}

if (!localStorage.getItem(STORAGE_KEYS.LIST)) {
    new Entity("Regras", "LIST", [
        { text: "Item 01" },
        { text: "Item 02" }
    ]).save();
}

if (!localStorage.getItem(STORAGE_KEYS.LINKS)) {
    new Entity("Links", "LINKS", [
        { text: "Guia de mockito para teste unitário", link: "https://medium.com/@braulliovg/guia-de-mockito-para-testes-unit%C3%A1rios-em-java-e7efbaba6626" }
    ]).save();
}

if (!localStorage.getItem(STORAGE_KEYS.CHECKBOX)) {
    new Entity("Callback", "CHECKBOX", [
        { text: "deletar arquivos", checked: false },
        { text: "ativar o processo", checked: true }
    ]).save();
}

function displayData() {
    const regrasList = document.getElementById("regras-list");
    const linksList = document.getElementById("links-list");
    const checkboxList = document.getElementById("checkbox-list");

    regrasList.innerHTML = "";
    linksList.innerHTML = "";
    checkboxList.innerHTML = "";

    Entity.load("LIST").forEach((item, index) => {
        const li = document.createElement("li");
        const span = document.createElement("span");
        // li.textContent = item.text;
        span.innerHTML = item.text;

        const btn = document.createElement("button");
        btn.textContent = "×";
        btn.classList.add("delete-group-btn");
        btn.onclick = () => removeTask("LIST", index);

        li.appendChild(span);
        li.appendChild(btn);
        regrasList.appendChild(li);
    });

    Entity.load("LINKS").forEach((item, index) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = item.link;
        a.textContent = item.text;
        a.target = "_blank";
        const btn = document.createElement("button");
        btn.textContent = "×";
        btn.classList.add("delete-group-btn");
        btn.onclick = () => removeTask("LINKS", index);
        li.appendChild(a);
        li.appendChild(btn);
        linksList.appendChild(li);
    });

    const checkboxData = Entity.load("CHECKBOX");
    checkboxData.forEach((item, index) => {
        const li = document.createElement("li");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = item.checked;
        checkbox.addEventListener("change", () => {
            checkboxData[index].checked = checkbox.checked;
            localStorage.setItem(STORAGE_KEYS.CHECKBOX, JSON.stringify(checkboxData));
        });

        const label = document.createElement("label");
        label.innerHTML = item.text.replace(/<br>/g, "<br>");
        label.style.display = "inline-block";
        label.style.marginLeft = "8px";

        const btn = document.createElement("button");
        btn.textContent = "×";
        btn.classList.add("delete-group-btn");
        btn.onclick = () => removeTask("CHECKBOX", index);

        li.appendChild(checkbox);
        li.appendChild(label);
        li.appendChild(btn);
        checkboxList.appendChild(li);
    });

}

displayData();

function addTask(type, inputId, listId) {
    const input = document.getElementById(inputId);
    const newItem = { text: input.value };

    if (newItem.text.trim() !== "") {
        const currentEntity = new Entity(type, type, Entity.load(type));
        currentEntity.items.push(newItem);
        currentEntity.save();
        input.value = "";
        displayData();
    }
}

function addLink() {
    const name = document.getElementById("links-input-text").value;
    const url = document.getElementById("links-input-url").value;
    if (name.trim() && url.trim()) {
        const newItem = { text: name, link: url };
        const currentEntity = new Entity("LINKS", "LINKS", Entity.load("LINKS"));
        currentEntity.items.push(newItem);
        currentEntity.save();
        document.getElementById("links-input-text").value = "";
        document.getElementById("links-input-url").value = "";
        displayData();
    }
}

function addCheckbox() {
    const text = document.getElementById("checkbox-input").value;
    if (text.trim()) {
        const newItem = { text: text, checked: false };
        const currentEntity = new Entity("CHECKBOX", "CHECKBOX", Entity.load("CHECKBOX"));
        currentEntity.items.push(newItem);
        currentEntity.save();
        document.getElementById("checkbox-input").value = "";
        displayData();
    }
}

function removeTask(type, index) {
    const currentEntity = new Entity(type, type, Entity.load(type));
    currentEntity.items.splice(index, 1);
    currentEntity.save();
    displayData();
}

function importBackup() {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];

    if (!file) {
        alert("Por favor, selecione um arquivo JSON.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const importedData = JSON.parse(event.target.result);

            localStorage.setItem("listData", JSON.stringify(importedData.listData || []));
            localStorage.setItem("linksData", JSON.stringify(importedData.linksData || []));
            localStorage.setItem("checkboxData", JSON.stringify(importedData.checkboxData || {}));

            location.reload();
        } catch (error) {
            alert("Erro ao importar JSON. Verifique o arquivo.");
        }
    };
    reader.readAsText(file);
}

function downloadBackup() {
    const now = new Date();
    const timestamp = now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0');

    const fileName = `backup-${timestamp}.json`;

    const listData = JSON.parse(localStorage.getItem(STORAGE_KEYS.LIST)) || [];
    const linksData = JSON.parse(localStorage.getItem(STORAGE_KEYS.LINKS)) || [];
    const checkboxData = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHECKBOX)) || {};

    const backupData = { listData, linksData, checkboxData };
    const jsonData = JSON.stringify(backupData, null, 4);

    const blob = new Blob([jsonData], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}