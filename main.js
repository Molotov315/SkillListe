"use strict";

let skillRequirements = {};

const saveProgress = () => localStorage.setItem('skillRequirements', JSON.stringify(skillRequirements));

const loadProgress = () => {
    const saved = localStorage.getItem('skillRequirements');
    if (saved) {
        skillRequirements = JSON.parse(saved);
        updateSkillSelect();
    }
};

const updateSkillSelect = () => {
    const select = document.getElementById('skillSelect');
    select.innerHTML = '<option value="" disabled selected>Bitte auswählen</option><option value="new">Neuen Skill anlegen</option>';
    Object.keys(skillRequirements).forEach(skill => {
        const option = document.createElement('option');
        option.value = skill;
        option.textContent = skill;
        select.appendChild(option);
    });
};

const handleSkillSelect = () => {
    const select = document.getElementById('skillSelect');
    const controlButtons = document.querySelector('.control-buttons');
    const levelSelect = document.querySelector('.level-select');
    const addBtn = document.getElementById('addRequirementBtn');
    const choice = select.value;

    if (choice === 'new') {
        showNewSkillInput();
        controlButtons.style.display = 'none';
        levelSelect.style.display = 'none';
        addBtn.style.display = 'none';
        document.getElementById('todoList').innerHTML = '';
        document.getElementById('doneList').innerHTML = '';
    } else if (choice) {
        controlButtons.style.display = 'flex';
        levelSelect.style.display = 'flex';
        addBtn.style.display = 'inline-flex';
        const selectedLevel = document.querySelector('input[name="level"]:checked');
        if (selectedLevel) {
            selectedLevel.dispatchEvent(new Event('change'));
        } else {
            displayRequirements();
        }
    } else {
        controlButtons.style.display = 'none';
        levelSelect.style.display = 'none';
        addBtn.style.display = 'none';
        document.getElementById('todoList').innerHTML = '';
        document.getElementById('doneList').innerHTML = '';
    }
};

const showNewSkillInput = () => {
    document.getElementById('skillSelect').style.display = 'none';
    document.querySelector('.skill-edit-container').style.display = 'flex';
    document.querySelector('.control-buttons').style.display = 'none';
    document.querySelector('.level-select').style.display = 'none';
    const input = document.getElementById('editSkillInput');
    input.value = '';
    input.focus();
};

const saveNewSkill = () => {
    const skillSelect = document.getElementById('skillSelect');
    const skillName = document.getElementById('editSkillInput').value.trim();
    if (!skillName) return alert('Bitte Skillnamen eingeben.');

    const oldName = skillSelect.value;
    const currentLevel = document.querySelector('input[name="level"]:checked')?.value || '1';

    if (oldName && oldName !== 'new' && oldName !== skillName) {
        skillRequirements[skillName] = { [currentLevel]: skillRequirements[oldName][currentLevel] };
        delete skillRequirements[oldName];
    } else if (!skillRequirements[skillName]) {
        skillRequirements[skillName] = {};
    }

    saveProgress();
    updateSkillSelect();
    resetNewSkillInput();
    skillSelect.value = skillName;
    handleSkillSelect();
};

const editSkillName = () => {
    const skillSelect = document.getElementById('skillSelect');
    const currentSkill = skillSelect.value;
    if (!currentSkill || currentSkill === 'new') return;

    document.getElementById('skillSelect').style.display = 'none';
    document.querySelector('.skill-edit-container').style.display = 'flex';

    const input = document.getElementById('editSkillInput');
    input.value = currentSkill;
    input.focus();
};

const resetNewSkillInput = () => {
    document.getElementById('skillSelect').style.display = 'block';
    document.querySelector('.skill-edit-container').style.display = 'none';
    document.getElementById('skillSelect').value = '';
};

// 🧹 Skill löschen mit Bestätigung
function deleteSkill(skillId) {
    showDeleteModal({
        title: "Skill löschen?",
        text: `Möchtest du den Skill "${skillId}" wirklich löschen?`,
        onConfirm: () => {
            delete skillRequirements[skillId];
            saveProgress();
            updateSkillSelect();
            document.getElementById('skillSelect').value = '';
            handleSkillSelect();
        }
    });
}

// ✅ Universelles Lösch-Modal
let deleteCallback = null;

function showDeleteModal({ title = "Wirklich löschen?", text = "Möchtest du diesen Eintrag wirklich löschen?", onConfirm }) {
    document.getElementById("confirmDeleteTitle").innerText = title;
    document.getElementById("confirmDeleteText").innerText = text;
    document.getElementById("confirmDeleteModal").style.display = "flex";
    deleteCallback = onConfirm;
}

function closeDeleteModal() {
    document.getElementById("confirmDeleteModal").style.display = "none";
    deleteCallback = null;
}

document.getElementById("confirmDeleteBtn").addEventListener("click", () => {
    if (deleteCallback) {
        deleteCallback();
        closeDeleteModal();
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        closeDeleteModal();
    }
});

const displayRequirements = () => {
    const skill = document.getElementById('skillSelect').value;
    const level = document.querySelector('input[name="level"]:checked')?.value || '1';
    const todo = document.getElementById('todoList');
    const done = document.getElementById('doneList');

    todo.innerHTML = '';
    done.innerHTML = '';

    if (skillRequirements[skill] && skillRequirements[skill][level]) {
        skillRequirements[skill][level].requirements.forEach(req => {
            const item = document.createElement('div');
            item.className = 'requirement-item';
            item.innerHTML = `
                <div class="flex">
                    <input type="checkbox">
                    <span>${req.text}</span>
                </div>
                <div class="buttons">
                    <button class="edit-btn" onclick="editRequirement(this)">✏️</button>
                    <button class="delete-btn" onclick="deleteRequirement(this)">❌</button>
                </div>
            `;

            const checkbox = item.querySelector('input');
            checkbox.checked = req.completed;
            checkbox.addEventListener('change', e => {
                req.completed = e.target.checked;
                (req.completed ? done : todo).appendChild(item);
                saveProgress();
            });

            (req.completed ? done : todo).appendChild(item);
        });
    }

    const addBtn = document.getElementById('addRequirementBtn');
    if (skill && skill !== 'new' && level) {
        addBtn.style.display = 'inline-flex';
    } else {
        addBtn.style.display = 'none';
    }
};

const showNewRequirement = () => {
    const skill = document.getElementById('skillSelect').value;
    const level = document.querySelector('input[name="level"]:checked')?.value;

    if (!skill || skill === 'new') return alert('Bitte zuerst einen Skill auswählen.');
    if (!level) return alert('Bitte zuerst ein Level auswählen.');

    showNewRequirementModal();
};

const showNewRequirementModal = () => {
    const modal = document.getElementById('newRequirementModal');
    const input = document.getElementById('newRequirementInput');
    input.value = '';
    modal.style.display = 'flex';
    input.focus();
};

const handleRequirementSave = () => {
    const skill = document.getElementById('skillSelect').value;
    const level = document.querySelector('input[name="level"]:checked')?.value;
    const input = document.getElementById('newRequirementInput');
    const text = input.value.trim();

    if (!text) return alert("Bitte gib eine Anforderung ein.");

    if (!skillRequirements[skill]) skillRequirements[skill] = {};
    if (!skillRequirements[skill][level]) skillRequirements[skill][level] = { requirements: [] };

    skillRequirements[skill][level].requirements.push({ text, completed: false });
    saveProgress();
    displayRequirements();
    closeRequirementModal();
};

const closeRequirementModal = () => {
    document.getElementById('newRequirementModal').style.display = 'none';
};

let currentEditItem = null;

const editRequirement = (button) => {
    currentEditItem = button.closest('.requirement-item');
    const span = currentEditItem.querySelector('span');
    const input = document.getElementById('editRequirementInput');

    input.value = span.textContent;
    document.getElementById('editRequirementModal').style.display = 'flex';
    input.focus();
};

const updateRequirementText = (item, newText) => {
    const skill = document.getElementById('skillSelect').value;
    const level = document.querySelector('input[name="level"]:checked')?.value;
    const oldText = item.querySelector('span').textContent;
    const reqs = skillRequirements[skill]?.[level]?.requirements;
    if (reqs) {
        const r = reqs.find(r => r.text === oldText);
        if (r) r.text = newText;
    }
};

// ✅ Bestätigtes Löschen von Anforderungen
const deleteRequirement = (button) => {
    const item = button.closest('.requirement-item');
    const span = item.querySelector('span');
    const skill = document.getElementById('skillSelect').value;
    const level = document.querySelector('input[name="level"]:checked')?.value;

    showDeleteModal({
        title: "Anforderung löschen?",
        text: `Möchtest du "${span.textContent}" wirklich löschen?`,
        onConfirm: () => {
            const reqs = skillRequirements[skill]?.[level]?.requirements;
            if (reqs) {
                const index = reqs.findIndex(r => r.text === span.textContent);
                if (index >= 0) {
                    reqs.splice(index, 1);
                    item.remove();
                    saveProgress();
                }
            }
        }
    });
};

const updateRequirements = () => {
    const skill = document.getElementById('skillSelect').value;
    if (skill && skill !== 'new') displayRequirements();
};

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('input[name="level"]').forEach(r => {
        r.addEventListener('change', updateRequirements);
    });
    document.getElementById('level1').checked = true;
    loadProgress();
    displayRequirements();

    document.getElementById('editRequirementSaveBtn').addEventListener('click', handleEditRequirementSave);
    document.getElementById('editRequirementCancelBtn').addEventListener('click', closeEditRequirementModal);
    document.getElementById('saveRequirementBtn').addEventListener('click', handleRequirementSave);
    document.getElementById('cancelRequirementBtn').addEventListener('click', closeRequirementModal);
});

const handleEditRequirementSave = () => {
    const input = document.getElementById('editRequirementInput');
    const newText = input.value.trim();
    if (!newText || !currentEditItem) return;

    const span = currentEditItem.querySelector('span');
    const oldText = span.textContent;

    const skill = document.getElementById('skillSelect').value;
    const level = document.querySelector('input[name="level"]:checked')?.value;
    const reqs = skillRequirements[skill]?.[level]?.requirements;

    if (reqs) {
        const req = reqs.find(r => r.text === oldText);
        if (req) req.text = newText;
    }

    span.textContent = newText;
    saveProgress();
    closeEditRequirementModal();
};

const closeEditRequirementModal = () => {
    document.getElementById('editRequirementModal').style.display = 'none';
    currentEditItem = null;
};

window.handleSkillSelect = handleSkillSelect;
window.saveNewSkill = saveNewSkill;
window.resetNewSkillInput = resetNewSkillInput;
window.editSkillName = editSkillName;
window.deleteSkill = deleteSkill;
window.showNewRequirement = showNewRequirement;
window.editRequirement = editRequirement;
window.deleteRequirement = deleteRequirement;