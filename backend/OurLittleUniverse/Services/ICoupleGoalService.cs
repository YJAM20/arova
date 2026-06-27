using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using LoveUniverse.Api.DTOs.CoupleGoals;

namespace LoveUniverse.Api.Services;

public interface ICoupleGoalService
{
    Task<ContentServiceResult<IReadOnlyList<CoupleGoalResponse>>> GetGoalsAsync(CancellationToken cancellationToken = default);
    Task<ContentServiceResult<CoupleGoalResponse>> GetGoalByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ContentServiceResult<CoupleGoalResponse>> CreateGoalAsync(CoupleGoalCreateRequest request, CancellationToken cancellationToken = default);
    Task<ContentServiceResult<CoupleGoalResponse>> UpdateGoalAsync(Guid id, CoupleGoalUpdateRequest request, CancellationToken cancellationToken = default);
    Task<ContentServiceResult<bool>> DeleteGoalAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ContentServiceResult<CoupleGoalResponse>> CompleteGoalAsync(Guid id, CancellationToken cancellationToken = default);

    Task<ContentServiceResult<CoupleGoalMilestoneResponse>> CreateMilestoneAsync(Guid goalId, MilestoneCreateRequest request, CancellationToken cancellationToken = default);
    Task<ContentServiceResult<CoupleGoalMilestoneResponse>> UpdateMilestoneAsync(Guid goalId, Guid milestoneId, MilestoneUpdateRequest request, CancellationToken cancellationToken = default);
    Task<ContentServiceResult<bool>> DeleteMilestoneAsync(Guid goalId, Guid milestoneId, CancellationToken cancellationToken = default);
}
