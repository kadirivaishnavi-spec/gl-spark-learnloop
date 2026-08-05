package com.gl.learnloop.skill.service;

import com.gl.learnloop.skill.client.UserFeignClient;
import com.gl.learnloop.skill.dto.SkillRequest;
import com.gl.learnloop.skill.entity.Skill;
import com.gl.learnloop.skill.repository.SkillRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.List;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SkillServiceTest {

    @Mock
    private SkillRepository skillRepository;

    @Mock
    private UserFeignClient userFeignClient;

    @InjectMocks
    private SkillService skillService;

    private SkillRequest request;
    private Skill skill;

    @BeforeEach
    void setUp() {
        request = new SkillRequest();
        request.setName("Java");
        request.setDescription("Java Programming");
        request.setCategory("Programming");
        request.setLevel("Beginner");
        request.setUserId(1L);

        skill = new Skill();
        skill.setId(1L);
        skill.setName("Java");
        skill.setDescription("Java Programming");
        skill.setCategory("Programming");
        skill.setLevel("Beginner");
        skill.setUserId(1L);
    }

    @Test
    void createSkill_Success() {
        when(skillRepository.save(any(Skill.class))).thenReturn(skill);

        Skill createdSkill = skillService.createSkill(request);

        assertNotNull(createdSkill);
        assertEquals(skill.getId(), createdSkill.getId());
        assertEquals(skill.getName(), createdSkill.getName());
        verify(userFeignClient).getUserById(request.getUserId());
        verify(skillRepository).save(any(Skill.class));
    }

    @Test
    void getSkillById_Success() {
        when(skillRepository.findById(1L)).thenReturn(Optional.of(skill));

        Skill foundSkill = skillService.getSkillById(1L);

        assertNotNull(foundSkill);
        assertEquals(1L, foundSkill.getId());
    }

    @Test
    void getSkillById_NotFound() {
        when(skillRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> skillService.getSkillById(99L));
        assertEquals("Skill not found", exception.getMessage());
    }

    @Test
    void updateSkill_Success() {
        when(skillRepository.findById(1L)).thenReturn(Optional.of(skill));
        when(skillRepository.save(any(Skill.class))).thenReturn(skill);

        Skill updatedSkill = skillService.updateSkill(1L, request);

        assertNotNull(updatedSkill);
        assertEquals(skill.getId(), updatedSkill.getId());
        verify(userFeignClient).getUserById(request.getUserId());
    }

    @Test
    void deleteSkill_Success() {
        when(skillRepository.existsById(1L)).thenReturn(true);
        doNothing().when(skillRepository).deleteById(1L);

        assertDoesNotThrow(() -> skillService.deleteSkill(1L));
        verify(skillRepository).deleteById(1L);
    }

    @Test
    void deleteSkill_NotFound() {
        when(skillRepository.existsById(99L)).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> skillService.deleteSkill(99L));
        assertEquals("Skill not found", exception.getMessage());
    }
}
