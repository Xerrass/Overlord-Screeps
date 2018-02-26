/**
 * Created by Bob on 7/12/2017.
 */

let _ = require('lodash');
const profiler = require('screeps-profiler');

function role(creep) {
    if (creep.memory.boostAttempt !== true) {
        let desiredReactions = [];
        let count = 1;
        for (let i = 0; i < desiredReactions.length; i++) {
            let lab = creep.pos.findClosestByRange(creep.room.structures, {filter: (s) => s.structureType === STRUCTURE_LAB && s.mineralType === desiredReactions[i] && s.mineralAmount >= 30 && s.energy >= 20});
            if (lab) {
                count++;
                if (lab.boostCreep(creep) === ERR_NOT_IN_RANGE) {
                    creep.shibMove(lab);
                }
            }
        }
        if (count === 1) {
            creep.memory.boostAttempt = true;
        }
        return null;
    }
    if (creep.hits < creep.hitsMax) {
        creep.heal(creep);
    }
    if (creep.memory.attackType === 'raid') {
        if (Game.time % 15 === 0 && Memory.warControl[creep.memory.attackTarget]) {
            let hostiles = creep.room.find(FIND_CREEPS, {filter: (c) => _.includes(FRIENDLIES, c.owner['username']) === false});
            let armedHostile = _.filter(hostiles, (e) => (e.getActiveBodyparts(ATTACK) >= 1 || e.getActiveBodyparts(RANGED_ATTACK) >= 1) && _.includes(FRIENDLIES, e.owner['username']) === false);
            let healers = _.filter(hostiles, (e) => (e.getActiveBodyparts(HEAL) >= 3) && _.includes(FRIENDLIES, e.owner['username']) === false);
            if ((armedHostile.length > 3 && healers.length > 1) || armedHostile.length > 4 && healers.length > 0) {
                Memory.warControl[creep.memory.attackTarget].threat = 2;
            }
            else if ((armedHostile.length > 2 && healers.length > 0) || armedHostile.length > 3 && healers.length > 0) {
                Memory.warControl[creep.memory.attackTarget].threat = 1;
            } else {
                Memory.warControl[creep.memory.attackTarget].threat = 0;
            }
        }
    }
    let squadLeader = _.filter(Game.creeps, (h) => h.memory.attackTarget === creep.memory.attackTarget && h.memory.squadLeader === true);
    if (squadLeader.length === 0 || creep.memory.squadLeader === true) {
        creep.memory.squadLeader = true;
        creep.tacticSquadLeaderMedic()
    } else {
        creep.tacticMedic()
    }
}

module.exports.role = profiler.registerFN(role, 'healerRole');
