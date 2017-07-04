/**
 * Created by Bob on 7/2/2017.
 */
let borderChecks = require('module.borderChecks');
let militaryFunctions = require('module.militaryFunctions');
const profiler = require('screeps-profiler');

let doNotAggress = RawMemory.segments[2];

tacticSquadLeaderMedic = function () {
    let squadLeader = _.filter(Game.creeps, (h) => h.memory.attackTarget === this.memory.attackTarget && h.memory.squadLeader === true);
    let siege = _.filter(Game.creeps, (h) => h.memory.attackTarget === this.memory.attackTarget && h.memory.siege === true);
    if (squadLeader.length === 0) this.memory.squadLeader = true;
    let targets = this.pos.findInRange(FIND_CREEPS, 6, {filter: (c) => c.hits < c.hitsMax && _.includes(doNotAggress, c.owner['username']) === true});
    let armedHostile = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: (e) => (e.getActiveBodyparts(ATTACK) >= 1 || e.getActiveBodyparts(RANGED_ATTACK) >= 1) && _.includes(doNotAggress, e.owner['username']) === false});
    if (siege.length > 0 && siege[0].memory.fallBackRoom && siege.length > 0 && this.pos.roomName !== siege[0].memory.fallBackRoom) {
        this.travelTo(new RoomPosition(25, 25, siege[0].memory.fallBackRoom), {range: 15});
        return;
    }
    if (this.pos.getRangeTo(armedHostile) <= 2) {
        if (targets.length > 0) {
            if (this.heal(targets[0]) === ERR_NOT_IN_RANGE) {
                this.travelTo(targets[0]);
                this.rangedHeal(targets[0]);
            }
        }
        this.fleeFromHostile(armedHostile);
    }
    if (!armedHostile || this.pos.getRangeTo(armedHostile) >= 6) {
        if (targets.length > 0) {
            if (this.heal(targets[0]) === ERR_NOT_IN_RANGE) {
                this.travelTo(targets[0]);
                this.rangedHeal(targets[0]);
            }
        }
        else if (this.memory.attackStarted !== true) {
            this.travelTo(Game.flags[this.memory.staging]);
            if (Game.flags[this.memory.attackTarget]) {
                let nearbyAttackers = this.pos.findInRange(_.filter(Game.creeps, (a) => a.memory.attackTarget === this.memory.attackTarget && a.memory.role === 'attacker'), 5);
                let nearbyHealers = this.pos.findInRange(_.filter(Game.creeps, (h) => h.memory.attackTarget === this.memory.attackTarget && h.memory.role === 'healer'), 5);
                let nearbyRanged = this.pos.findInRange(_.filter(Game.creeps, (h) => h.memory.attackTarget === this.memory.attackTarget && h.memory.role === 'ranged'), 5);
                let nearbyDeconstructors = this.pos.findInRange(_.filter(Game.creeps, (h) => h.memory.attackTarget === this.memory.attackTarget && h.memory.role === 'deconstructor'), 5);
                if (nearbyRanged.length >= this.memory.waitForRanged && nearbyAttackers.length >= this.memory.waitForAttackers && nearbyHealers.length >= this.memory.waitForHealers && nearbyDeconstructors.length >= this.memory.waitForDeconstructor) {
                    this.memory.attackStarted = true;
                }
            }
        } else {
            this.travelTo(Game.flags[this.memory.attackTarget], {allowHostile: false});
        }
    } else {
        if (targets.length > 0) {
            if (this.heal(targets[0]) === ERR_NOT_IN_RANGE) {
                this.rangedHeal(targets[0]);
            }
        }
        this.fleeFromHostile(armedHostile);
    }
};
Creep.prototype.tacticSquadLeaderMedic = profiler.registerFN(tacticSquadLeaderMedic, 'squadLeaderMedicTactic');

tacticMedic = function () {
    let squadLeader = _.filter(Game.creeps, (h) => h.memory.attackTarget === this.memory.attackTarget && h.memory.squadLeader === true);
    let targets = this.pos.findInRange(FIND_CREEPS, 7, {filter: (c) => c.hits < c.hitsMax && _.includes(doNotAggress, c.owner['username']) === true});
    let armedHostile = this.pos.findClosestByPath(FIND_HOSTILE_CREEPS, {filter: (e) => (e.getActiveBodyparts(ATTACK) >= 1 || e.getActiveBodyparts(RANGED_ATTACK) >= 1) && _.includes(doNotAggress, e.owner['username']) === false});
    if (!armedHostile || this.pos.getRangeTo(armedHostile) >= 3) {
        if (targets.length > 0) {
            if (this.heal(targets[0]) === ERR_NOT_IN_RANGE) {
                this.travelTo(targets[0]);
                this.rangedHeal(targets[0]);
            }
        }
        else if (this.pos.getRangeTo(squadLeader[0]) > 4) {
            this.travelTo(squadLeader[0]);
        }
    } else {
        if (targets.length > 0) {
            if (this.heal(targets[0]) === ERR_NOT_IN_RANGE) {
                this.rangedHeal(targets[0]);
            }
        }
        this.fleeFromHostile(armedHostile);
    }
};
Creep.prototype.tacticMedic = profiler.registerFN(tacticMedic, 'tacticMedicTactic');